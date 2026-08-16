class FitForgeError(Exception):
    status_code = 500
    detail = "Internal server error"

    def __init__(self, detail: str | None = None):
        if detail is not None:
            self.detail = detail
        super().__init__(self.detail)


class NotFoundError(FitForgeError):
    status_code = 404
    detail = "Resource not found"


class ConflictError(FitForgeError):
    status_code = 409
    detail = "Resource already exists"


class UnauthorizedError(FitForgeError):
    status_code = 401
    detail = "Unauthorized"


class ForbiddenError(FitForgeError):
    status_code = 403
    detail = "Forbidden"


class PaymentRequiredError(FitForgeError):
    status_code = 402
    detail = "Payment required"