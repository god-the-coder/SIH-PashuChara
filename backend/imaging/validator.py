"""Usability gate for a farmer-uploaded photo, run before it's ever stored.

Deliberately conservative: this only rejects photos that are unreadable, too
small to show useful detail, or effectively blank (out of focus / lens
covered / solid color). It is not a quality-scoring model — actual visual
quality assessment is Gemini's job (see ai/client.py).
"""

import io

import numpy as np
from PIL import Image, UnidentifiedImageError

from .exceptions import ImageValidationError

MIN_DIMENSION_PX = 200
MAX_DIMENSION_PX = 8000
MIN_STD_DEV = 8.0  # grayscale std-dev floor below which a photo reads as blank/blurred
ALLOWED_FORMATS = {'JPEG', 'PNG', 'WEBP'}


def validate_image(data):
    """Raises ImageValidationError if `data` isn't a usable photo."""
    if not data:
        raise ImageValidationError('The uploaded file is empty.')

    try:
        with Image.open(io.BytesIO(data)) as probe:
            probe.verify()
    except (UnidentifiedImageError, OSError, ValueError):
        raise ImageValidationError('The uploaded file is not a readable image.')

    # verify() leaves the handle unusable for further reads, so reopen for the
    # actual checks below.
    try:
        with Image.open(io.BytesIO(data)) as img:
            image_format = img.format
            width, height = img.size
            grayscale = np.asarray(img.convert('L'))
    except (UnidentifiedImageError, OSError, ValueError):
        raise ImageValidationError('The uploaded file is not a readable image.')

    if image_format not in ALLOWED_FORMATS:
        raise ImageValidationError(f'Unsupported image format: {image_format}. Use JPEG, PNG or WEBP.')

    if width < MIN_DIMENSION_PX or height < MIN_DIMENSION_PX:
        raise ImageValidationError(
            f'Image is too small ({width}x{height}px). Please retake it at least '
            f'{MIN_DIMENSION_PX}x{MIN_DIMENSION_PX}px.',
        )

    if width > MAX_DIMENSION_PX or height > MAX_DIMENSION_PX:
        raise ImageValidationError('Image resolution is unusually large. Please retake with a standard camera setting.')

    if float(grayscale.std()) < MIN_STD_DEV:
        raise ImageValidationError(
            'Image appears blank or out of focus. Please retake with better lighting and focus.',
        )
