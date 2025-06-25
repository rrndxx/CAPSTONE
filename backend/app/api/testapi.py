from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.deps import get_db
from app.models.testmodel import TestModel
from pydantic import BaseModel

router = APIRouter()

class TestCreate(BaseModel):
    name: str

class UpdateTest(BaseModel):
    name: str

@router.get("/test")
def test_db(db: Session = Depends(get_db)):
    try:
        count = db.query(TestModel).count()
        return {"status": "connected", "records": count}
    except Exception as e:
        return {"status": "error", "details": str(e)}

@router.post("/test")
def create_test_entry(entry: TestCreate, db: Session = Depends(get_db)):
    new_entry = TestModel(name=entry.name)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return {"message": "Inserted", "entry": {"id": new_entry.id, "name": new_entry.name}}


@router.delete("/test/{entry_id}")
def delete_test_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(TestModel).filter(TestModel.id == entry_id).first()
    if not entry:
        return {"status": "error", "message": f"No entry found with ID {entry_id}"}
    
    db.delete(entry)
    db.commit()
    return {"status": "deleted", "id": entry_id}

@router.get("/test/all")
def list_all_tests(db: Session = Depends(get_db)):
    entries = db.query(TestModel).all()
    return {"data": [{"id": e.id, "name": e.name} for e in entries]}

@router.get("/test/search")
def search_tests(name: str, db: Session = Depends(get_db)):
    results = db.query(TestModel).filter(TestModel.name.ilike(f"%{name}%")).all()
    return {"results": [{"id": r.id, "name": r.name} for r in results]}

@router.put("/test/{entry_id}")
def update_test_entry(entry_id: int, update: UpdateTest, db: Session = Depends(get_db)):
    entry = db.query(TestModel).filter(TestModel.id == entry_id).first()
    if not entry:
        return {"status": "error", "message": f"No entry found with ID {entry_id}"}

    entry.name = update.name
    db.commit()
    db.refresh(entry)
    return {"status": "updated", "entry": {"id": entry.id, "name": entry.name}}
