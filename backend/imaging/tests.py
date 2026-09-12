import io

import numpy as np
from django.test import SimpleTestCase
from PIL import Image

from .exceptions import ImageProcessingError, ImageValidationError
from .processor import create_processed_copy
from .validator import validate_image


def _make_jpeg_bytes(size=(400, 400), color=None):
    """A photo-like JPEG: random noise so it isn't rejected as blank."""
    if color is not None:
        array = np.full((size[1], size[0], 3), color, dtype=np.uint8)
    else:
        rng = np.random.default_rng(seed=0)
        array = rng.integers(0, 255, (size[1], size[0], 3), dtype=np.uint8)
    buf = io.BytesIO()
    Image.fromarray(array).save(buf, format='JPEG')
    return buf.getvalue()


class ValidateImageTests(SimpleTestCase):
    def test_rejects_empty_bytes(self):
        with self.assertRaises(ImageValidationError):
            validate_image(b'')

    def test_rejects_non_image_bytes(self):
        with self.assertRaises(ImageValidationError):
            validate_image(b'this is not an image')

    def test_rejects_too_small_image(self):
        with self.assertRaises(ImageValidationError):
            validate_image(_make_jpeg_bytes(size=(50, 50)))

    def test_rejects_blank_solid_color_image(self):
        with self.assertRaises(ImageValidationError):
            validate_image(_make_jpeg_bytes(size=(400, 400), color=(120, 120, 120)))

    def test_accepts_usable_photo(self):
        validate_image(_make_jpeg_bytes())  # should not raise

    def test_rejects_unsupported_format(self):
        buf = io.BytesIO()
        rng = np.random.default_rng(seed=1)
        array = rng.integers(0, 255, (300, 300, 3), dtype=np.uint8)
        Image.fromarray(array).save(buf, format='BMP')
        with self.assertRaises(ImageValidationError):
            validate_image(buf.getvalue())


class CreateProcessedCopyTests(SimpleTestCase):
    def test_returns_valid_jpeg_bytes(self):
        processed = create_processed_copy(_make_jpeg_bytes())
        with Image.open(io.BytesIO(processed)) as img:
            img.verify()

    def test_downscales_large_images(self):
        processed = create_processed_copy(_make_jpeg_bytes(size=(2000, 1500)))
        with Image.open(io.BytesIO(processed)) as img:
            self.assertLessEqual(max(img.size), 1280)

    def test_does_not_upscale_small_images(self):
        processed = create_processed_copy(_make_jpeg_bytes(size=(400, 300)))
        with Image.open(io.BytesIO(processed)) as img:
            self.assertEqual(img.size, (400, 300))

    def test_original_bytes_are_unmodified(self):
        original = _make_jpeg_bytes()
        original_copy = bytes(original)
        create_processed_copy(original)
        self.assertEqual(original, original_copy)

    def test_rejects_undecodable_bytes(self):
        with self.assertRaises(ImageProcessingError):
            create_processed_copy(b'not an image at all')


class GroqGuidanceTests(SimpleTestCase):
    def test_analyze_capture_quality_detects_dark_and_blur(self):
        from ai.groq_guidance import analyze_capture_quality

        # Dark image
        dark_bytes = _make_jpeg_bytes(color=(10, 10, 10))
        metrics = analyze_capture_quality(dark_bytes)
        self.assertFalse(metrics['is_good'])
        self.assertIn(metrics['issue'], ('dark', 'blurry', 'not_feed'))

        # Clean feed-like image
        feed_bytes = _make_jpeg_bytes(color=(40, 120, 60))
        metrics = analyze_capture_quality(feed_bytes)
        self.assertIn('issue', metrics)
        self.assertIn('blur_score', metrics)

    def test_generate_groq_guidance_returns_audio_instruction(self):
        from ai.groq_guidance import generate_groq_guidance

        sample_bytes = _make_jpeg_bytes(color=(10, 10, 10))
        result = generate_groq_guidance(
            step_label="Front Overview",
            step_description="Show overall feed",
            image_bytes=sample_bytes,
            language="hi",
        )
        self.assertIn('is_good', result)
        self.assertIn('feedback', result)
        self.assertIn('audio_instruction', result)
        self.assertTrue(len(result['audio_instruction']) > 0)
