class ImageValidationError(Exception):
    """Raised when an uploaded photo fails the usability check (see validator.py)."""


class ImageProcessingError(Exception):
    """Raised when a usability-validated image still can't be turned into a
    processed copy (see processor.py). Should be rare — validation already
    ruled out corrupt/unreadable files."""
