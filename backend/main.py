from fastapi import FastAPI
from database import Base, engine
from models import User, Hazard, StatusUpdate

app = FastAPI()

Base.metadata.create_all(bind=engine)