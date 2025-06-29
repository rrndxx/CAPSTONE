from app.models.models import Base
from app.db.session import engine

def init_db():
    print("Naghimog mga lamesa")
    Base.metadata.create_all(bind=engine)
    print("mana")

if __name__ == "__main__":
    init_db()