from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import engine, Base
from app.api import testapi

app = FastAPI(title="NetDetect API")

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(testapi.router)
@app.get("/")
def root():
    Base.metadata.create_all(bind=engine)
    return {"message": "NetDetect backend is walking"}
