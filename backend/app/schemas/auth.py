import uuid

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.security import password_problem


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    role: str

    model_config = {"from_attributes": True}


class SessionOut(BaseModel):
    user: UserOut
    csrf_token: str


class _NewPassword(BaseModel):
    new_password: str = Field(max_length=256)

    @field_validator("new_password")
    @classmethod
    def _strong_enough(cls, value: str) -> str:
        problem = password_problem(value)
        if problem:
            raise ValueError(problem)
        return value


class ChangePasswordRequest(_NewPassword):
    current_password: str = Field(min_length=1, max_length=256)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(_NewPassword):
    token: str = Field(min_length=20, max_length=200)
