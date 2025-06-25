from sqlalchemy import Column, Integer, String
from app.database.session import Base


class TestModel(Base):
    __tablename__ = "test_model"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    