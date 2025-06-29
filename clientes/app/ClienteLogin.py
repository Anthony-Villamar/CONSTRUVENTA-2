from pydantic import BaseModel


class ClienteLogin(BaseModel):
    email: str
    password: str
