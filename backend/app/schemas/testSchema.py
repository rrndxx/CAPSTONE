from pydantic import BaseModel

class TestCreate(BaseModel):
    name: str

class TestRead(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True