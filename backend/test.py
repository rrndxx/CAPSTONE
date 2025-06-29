from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

if __name__ == "__main__":
    try:
        with engine.connect() as conn:
            print('hello')
    except Exception as e:
        print(e)