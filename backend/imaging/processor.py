"""Builds the processed/supplementary copy of a validated photo.

Original bytes are never touched — the caller stores this output as a second,
separate file (InspectionImage.processed_image) alongside the untouched
original. Every step here is a controlled, deterministic pixel-level
transformation; nothing here is AI-generated or lossy-in-content, only
lossy-in-fidelity (resize/recompress) to make the material's condition more
visible to both a human and Gemini.
"""

import cv2
import numpy as np

from .exceptions import ImageProcessingError

MAX_DIMENSION_PX = 1280
JPEG_QUALITY = 90


def create_processed_copy(data):
    """Resize, normalize brightness/contrast, denoise and lightly sharpen the
    image in `data` (raw original bytes). Returns JPEG-encoded bytes."""
    array = np.frombuffer(data, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise ImageProcessingError('OpenCV could not decode the image for processing.')

    image = _resize(image)
    image = _normalize_brightness_contrast(image)
    image = _denoise(image)
    image = _sharpen(image)

    ok, encoded = cv2.imencode('.jpg', image, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
    if not ok:
        raise ImageProcessingError('Failed to encode the processed image.')
    return encoded.tobytes()


def _resize(image):
    """Downscale only — never upscale a smaller photo, that would fabricate detail."""
    height, width = image.shape[:2]
    longest_side = max(height, width)
    if longest_side <= MAX_DIMENSION_PX:
        return image
    scale = MAX_DIMENSION_PX / longest_side
    new_size = (round(width * scale), round(height * scale))
    return cv2.resize(image, new_size, interpolation=cv2.INTER_AREA)


def _normalize_brightness_contrast(image):
    """CLAHE on the L channel in LAB space evens out brightness/contrast without
    blowing out colors the way flat histogram equalization on raw RGB would —
    important since color (discoloration, mold tint) is itself a finding."""
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_channel = clahe.apply(l_channel)
    lab = cv2.merge((l_channel, a_channel, b_channel))
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def _denoise(image):
    return cv2.fastNlMeansDenoisingColored(image, None, h=6, hColor=6, templateWindowSize=7, searchWindowSize=21)


def _sharpen(image):
    """Unsharp mask (subtract a blurred copy) boosts edge contrast — texture,
    mold-fiber edges — without amplifying sensor noise the way a raw
    sharpening kernel would."""
    blurred = cv2.GaussianBlur(image, (0, 0), sigmaX=3)
    return cv2.addWeighted(image, 1.5, blurred, -0.5, 0)
