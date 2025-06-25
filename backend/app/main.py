from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import Base, engine
from app.api import testapi

app = FastAPI(title="Netdetect")

app.add_middleware(
    CORSMiddleware,
    allowroigins=["*"],
    allowcredentials=True,
    allowmethods=["*"],
    allowheaders=["*"],
)

app.include_router(testapi.router)

@app.get("/")
def root():
    Base.metadata.create_all(bind=engine)
    return {"message": "Welcome to Netdetect!"}