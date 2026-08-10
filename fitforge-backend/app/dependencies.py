from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import decode_access_token, SessionUser

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

DbSession = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]


def get_current_user(db: DbSession, token: TokenDep) -> SessionUser:
    return decode_access_token(db, token)


CurrentUser = Annotated[SessionUser, Depends(get_current_user)]