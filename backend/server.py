from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Tour Models
class Tour(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    destination: str
    duration: int  # in days
    price: float
    max_capacity: int
    available_spots: int
    start_date: str
    end_date: str
    image_url: str
    package_details: dict  # transportation, accommodation, activities
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TourCreate(BaseModel):
    title: str
    description: str
    destination: str
    duration: int
    price: float
    max_capacity: int
    available_spots: int
    start_date: str
    end_date: str
    image_url: str
    package_details: dict

class TourUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    destination: Optional[str] = None
    duration: Optional[int] = None
    price: Optional[float] = None
    max_capacity: Optional[int] = None
    available_spots: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    image_url: Optional[str] = None
    package_details: Optional[dict] = None

# Tour API Endpoints
@api_router.post("/tours", response_model=Tour)
async def create_tour(tour_data: TourCreate):
    tour_dict = tour_data.dict()
    tour_obj = Tour(**tour_dict)
    await db.tours.insert_one(tour_obj.dict())
    return tour_obj

@api_router.get("/tours", response_model=List[Tour])
async def get_tours(search: Optional[str] = None, destination: Optional[str] = None):
    query = {}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"destination": {"$regex": search, "$options": "i"}}
        ]
    if destination:
        query["destination"] = {"$regex": destination, "$options": "i"}
    
    tours = await db.tours.find(query).to_list(1000)
    return [Tour(**tour) for tour in tours]

@api_router.get("/tours/{tour_id}", response_model=Tour)
async def get_tour(tour_id: str):
    tour = await db.tours.find_one({"id": tour_id})
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    return Tour(**tour)

@api_router.put("/tours/{tour_id}", response_model=Tour)
async def update_tour(tour_id: str, tour_data: TourUpdate):
    tour = await db.tours.find_one({"id": tour_id})
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    
    update_data = {k: v for k, v in tour_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.tours.update_one({"id": tour_id}, {"$set": update_data})
    updated_tour = await db.tours.find_one({"id": tour_id})
    return Tour(**updated_tour)

@api_router.delete("/tours/{tour_id}")
async def delete_tour(tour_id: str):
    result = await db.tours.delete_one({"id": tour_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tour not found")
    return {"message": "Tour deleted successfully"}

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Travel Agency Management API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()