from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.deps import get_db
from app.models.testModel import TestModel
from app.schemas.testSchema import TestCreate, TestRead

router = APIRouter(prefix="/test")

@router.post("/")
def create_test(payload: TestCreate, db: Session = Depends(get_db)):
    item = TestModel(name=payload.name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/")
def read_all(db: Session = Depends(get_db)):
    return db.query(TestModel).all()

@router.get("/{item_id}")
def read_item(item_id: int, db: Session = Depends(get_db)):
    return db.query(TestModel).filter(TestModel.id == item_id).first()

@router.put("/{item_id}")
def update_item(item_id: int, payload: TestCreate, db: Session = Depends(get_db)):
    item = db.query(TestModel).filter(TestModel.id == item_id).first()
    item.name = payload.name
    db.commit()
    return item

@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db.query(TestModel).filter(TestModel.id == item_id).delete()
    db.commit()
    return {"message": "Deleted"}
