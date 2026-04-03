from dotenv import load_dotenv
load_dotenv()

import os
import jwt
import bcrypt
import logging
import pathlib
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated, Any
from pathlib import Path

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict

ROOT_DIR = Path(__file__).parent
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="AutoNorth Motors API")
api_router = APIRouter(prefix="/api")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_ALGORITHM = "HS256"


def _validate_object_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str) and ObjectId.is_valid(v):
        return v
    raise ValueError(f"Invalid ObjectId: {v}")


PyObjectId = Annotated[str, BeforeValidator(_validate_object_id)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self) -> dict:
        d = self.model_dump(by_alias=True, exclude_none=True)
        if "_id" in d and d["_id"] is None:
            del d["_id"]
        return d

    @classmethod
    def from_mongo(cls, doc: dict):
        if doc and "_id" in doc:
            doc = {**doc, "_id": str(doc["_id"])}
        return cls(**doc)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


class LoginRequest(BaseModel):
    email: str
    password: str


class VehicleCreate(BaseModel):
    title: str
    make: str
    model: str
    year: int
    price: float
    mileage: int = 0
    condition: str = "used"
    body_type: str = "Sedan"
    fuel_type: str = "Gas"
    transmission: str = "Automatic"
    exterior_color: str = ""
    interior_color: str = ""
    engine: str = ""
    drivetrain: str = ""
    doors: int = 4
    seats: int = 5
    vin: str = ""
    stock_number: str = ""
    description: str = ""
    features: List[str] = []
    images: List[str] = []
    status: str = "available"
    featured: bool = False


class VehicleUpdate(BaseModel):
    title: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    price: Optional[float] = None
    mileage: Optional[int] = None
    condition: Optional[str] = None
    body_type: Optional[str] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    exterior_color: Optional[str] = None
    interior_color: Optional[str] = None
    engine: Optional[str] = None
    drivetrain: Optional[str] = None
    doors: Optional[int] = None
    seats: Optional[int] = None
    vin: Optional[str] = None
    stock_number: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None
    featured: Optional[bool] = None


class Vehicle(BaseDocument):
    title: str
    make: str
    model: str
    year: int
    price: float
    mileage: int = 0
    condition: str = "used"
    body_type: str = "Sedan"
    fuel_type: str = "Gas"
    transmission: str = "Automatic"
    exterior_color: str = ""
    interior_color: str = ""
    engine: str = ""
    drivetrain: str = ""
    doors: int = 4
    seats: int = 5
    vin: str = ""
    stock_number: str = ""
    description: str = ""
    features: List[str] = []
    images: List[str] = []
    status: str = "available"
    featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LeadCreate(BaseModel):
    lead_type: str
    name: str
    email: str
    phone: str = ""
    vehicle_id: Optional[str] = None
    vehicle_title: Optional[str] = None
    message: str = ""
    preferred_contact: str = "email"
    down_payment: Optional[float] = None
    trade_in_value: Optional[float] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None


class Lead(BaseDocument):
    lead_type: str
    name: str
    email: str
    phone: str = ""
    vehicle_id: Optional[str] = None
    vehicle_title: Optional[str] = None
    message: str = ""
    preferred_contact: str = "email"
    down_payment: Optional[float] = None
    trade_in_value: Optional[float] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LeadStatusUpdate(BaseModel):
    status: str


@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie("access_token", access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": user.get("name", "Admin"), "role": user.get("role", "admin")}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def me(current_user: dict = Depends(get_current_user)):
    return current_user


@api_router.get("/vehicles")
async def list_vehicles(
    condition: Optional[str] = None,
    make: Optional[str] = None,
    body_type: Optional[str] = None,
    fuel_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_year: Optional[int] = None,
    max_year: Optional[int] = None,
    status: Optional[str] = "available",
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    query = {}
    if condition:
        query["condition"] = condition
    if make:
        query["make"] = {"$regex": make, "$options": "i"}
    if body_type:
        query["body_type"] = body_type
    if fuel_type:
        query["fuel_type"] = fuel_type
    if status and status != "all":
        query["status"] = status
    if featured is not None:
        query["featured"] = featured
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    if min_year is not None or max_year is not None:
        query["year"] = {}
        if min_year is not None:
            query["year"]["$gte"] = min_year
        if max_year is not None:
            query["year"]["$lte"] = max_year
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"make": {"$regex": search, "$options": "i"}},
            {"model": {"$regex": search, "$options": "i"}},
        ]
    total = await db.vehicles.count_documents(query)
    cursor = db.vehicles.find(query).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(limit)
    vehicles = [Vehicle.from_mongo(doc).model_dump(mode='json') for doc in docs]
    return {"vehicles": vehicles, "total": total, "skip": skip, "limit": limit}


@api_router.get("/vehicles/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    doc = await db.vehicles.find_one({"_id": ObjectId(vehicle_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return Vehicle.from_mongo(doc).model_dump(mode='json')


@api_router.post("/vehicles")
async def create_vehicle(data: VehicleCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    doc = data.model_dump()
    doc["created_at"] = now
    doc["updated_at"] = now
    result = await db.vehicles.insert_one(doc)
    doc["_id"] = result.inserted_id
    return Vehicle.from_mongo(doc).model_dump(mode='json')


@api_router.put("/vehicles/{vehicle_id}")
async def update_vehicle(vehicle_id: str, data: VehicleUpdate, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    await db.vehicles.update_one({"_id": ObjectId(vehicle_id)}, {"$set": update_data})
    doc = await db.vehicles.find_one({"_id": ObjectId(vehicle_id)})
    return Vehicle.from_mongo(doc).model_dump(mode='json')


@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    result = await db.vehicles.delete_one({"_id": ObjectId(vehicle_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"message": "Vehicle deleted"}


@api_router.post("/leads")
async def create_lead(data: LeadCreate):
    doc = data.model_dump()
    doc["status"] = "new"
    doc["created_at"] = datetime.now(timezone.utc)
    result = await db.leads.insert_one(doc)
    doc["_id"] = result.inserted_id
    return Lead.from_mongo(doc).model_dump(mode='json')


@api_router.get("/leads")
async def list_leads(
    status: Optional[str] = None,
    lead_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if status and status != "all":
        query["status"] = status
    if lead_type and lead_type != "all":
        query["lead_type"] = lead_type
    docs = await db.leads.find(query).sort("created_at", -1).to_list(500)
    return [Lead.from_mongo(doc).model_dump(mode='json') for doc in docs]


@api_router.put("/leads/{lead_id}")
async def update_lead_status(lead_id: str, data: LeadStatusUpdate, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(lead_id):
        raise HTTPException(status_code=400, detail="Invalid lead ID")
    await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": {"status": data.status}})
    doc = await db.leads.find_one({"_id": ObjectId(lead_id)})
    return Lead.from_mongo(doc).model_dump(mode='json')


@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(lead_id):
        raise HTTPException(status_code=400, detail="Invalid lead ID")
    await db.leads.delete_one({"_id": ObjectId(lead_id)})
    return {"message": "Lead deleted"}


@api_router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    total = await db.vehicles.count_documents({})
    available = await db.vehicles.count_documents({"status": "available"})
    sold = await db.vehicles.count_documents({"status": "sold"})
    featured = await db.vehicles.count_documents({"featured": True})
    total_leads = await db.leads.count_documents({})
    new_leads = await db.leads.count_documents({"status": "new"})
    contacted = await db.leads.count_documents({"status": "contacted"})
    recent_docs = await db.leads.find({}).sort("created_at", -1).limit(5).to_list(5)
    return {
        "total_vehicles": total,
        "available": available,
        "sold": sold,
        "featured": featured,
        "total_leads": total_leads,
        "new_leads": new_leads,
        "contacted": contacted,
        "recent_leads": [Lead.from_mongo(d).model_dump(mode='json') for d in recent_docs]
    }


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.vehicles.create_index([("status", 1), ("featured", -1)])
    await db.leads.create_index([("created_at", -1)])

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@autonorth.ca")
    admin_password = os.environ.get("ADMIN_PASSWORD", "AdminPass2024")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "AutoNorth Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        })
        logger.info(f"Admin created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    vehicle_count = await db.vehicles.count_documents({})
    if vehicle_count == 0:
        await seed_vehicles()

    pathlib.Path("/app/memory").mkdir(exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write(f"# AutoNorth Motors Test Credentials\n\n## Admin Login\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n## Key Endpoints\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n- GET /api/vehicles\n- GET /api/leads (admin only)\n- GET /api/stats (admin only)\n")


async def seed_vehicles():
    now = datetime.now(timezone.utc)
    vehicles = [
        {
            "title": "2024 Ford F-150 XLT SuperCrew 4x4",
            "make": "Ford", "model": "F-150", "year": 2024, "price": 52900, "mileage": 12000,
            "condition": "used", "body_type": "Truck", "fuel_type": "Gas", "transmission": "Automatic",
            "exterior_color": "Oxford White", "interior_color": "Black", "engine": "3.5L EcoBoost V6",
            "drivetrain": "4WD", "doors": 4, "seats": 5, "vin": "1FTFW1ET4EKF34678", "stock_number": "A001",
            "description": "Powerful and versatile, this 2024 Ford F-150 XLT is ready for any challenge. Features the 3.5L EcoBoost V6 with 4WD capability, heated front seats, and the latest SYNC 4 infotainment. Low mileage and in excellent condition.",
            "features": ["Adaptive Cruise Control", "Lane Keeping Assist", "Backup Camera", "Apple CarPlay", "Android Auto", "Heated Front Seats", "Remote Start", "Trailer Tow Package", "Pro Power Onboard"],
            "images": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80"],
            "status": "available", "featured": True, "created_at": now, "updated_at": now
        },
        {
            "title": "2023 Ford Explorer ST Performance AWD",
            "make": "Ford", "model": "Explorer", "year": 2023, "price": 62500, "mileage": 18500,
            "condition": "used", "body_type": "SUV", "fuel_type": "Gas", "transmission": "Automatic",
            "exterior_color": "Carbonized Gray", "interior_color": "Ebony", "engine": "3.0L EcoBoost V6",
            "drivetrain": "AWD", "doors": 4, "seats": 7, "vin": "1FM5K8GCXPGA12345", "stock_number": "A002",
            "description": "Experience the thrill of the Explorer ST. With 400 horsepower from the 3.0L EcoBoost and sport-tuned suspension, it seats 7 in premium luxury. Panoramic sunroof and wireless charging included.",
            "features": ["360-Degree Camera", "Panoramic Sunroof", "Wireless Charging", "SYNC 4", "20-inch Sport Wheels", "Sport-Tuned Suspension", "Heated/Cooled Seats", "Third Row Seating", "B&O Sound"],
            "images": ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80", "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80"],
            "status": "available", "featured": True, "created_at": now, "updated_at": now
        },
        {
            "title": "2024 Ford Mustang GT Fastback 5.0L V8",
            "make": "Ford", "model": "Mustang", "year": 2024, "price": 45900, "mileage": 5200,
            "condition": "used", "body_type": "Coupe", "fuel_type": "Gas", "transmission": "Manual",
            "exterior_color": "Race Red", "interior_color": "Ebony", "engine": "5.0L Ti-VCT V8 480hp",
            "drivetrain": "RWD", "doors": 2, "seats": 4, "vin": "1FA6P8CF4L5150023", "stock_number": "A003",
            "description": "Pure American muscle. The 2024 Mustang GT with the legendary 5.0L Coyote V8 produces 480 horsepower. Active exhaust, Brembo brakes, and MagneRide suspension deliver a raw, exhilarating drive.",
            "features": ["5.0L Coyote V8 480hp", "SYNC 4 12in Display", "Active Exhaust", "Brembo 6-Piston Brakes", "MagneRide Suspension", "Launch Control", "Line Lock", "Track Apps"],
            "images": ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80", "https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=800&q=80"],
            "status": "available", "featured": True, "created_at": now, "updated_at": now
        },
        {
            "title": "2025 Ford Escape Plug-In Hybrid SE",
            "make": "Ford", "model": "Escape", "year": 2025, "price": 41200, "mileage": 0,
            "condition": "new", "body_type": "SUV", "fuel_type": "Hybrid", "transmission": "Automatic",
            "exterior_color": "Agate Black", "interior_color": "Sandstone", "engine": "2.5L PHEV",
            "drivetrain": "FWD", "doors": 4, "seats": 5, "vin": "", "stock_number": "N001",
            "description": "Drive into the future. The 2025 Ford Escape PHEV offers up to 61km electric range. Perfect for eco-conscious drivers who want modern technology and smart fuel savings.",
            "features": ["61km Electric Range", "Wireless Charging", "SYNC 4 OTA", "Co-Pilot360", "B&O Audio", "Panoramic Roof", "Hands-Free Tailgate"],
            "images": ["https://images.unsplash.com/photo-1567843-afedf47a4f3e?w=800&q=80"],
            "status": "available", "featured": False, "created_at": now, "updated_at": now
        },
        {
            "title": "2023 Ford Maverick XLT Hybrid",
            "make": "Ford", "model": "Maverick", "year": 2023, "price": 34500, "mileage": 24000,
            "condition": "used", "body_type": "Truck", "fuel_type": "Hybrid", "transmission": "Automatic",
            "exterior_color": "Velocity Blue", "interior_color": "Ebony", "engine": "2.5L Hybrid",
            "drivetrain": "FWD", "doors": 4, "seats": 5, "vin": "3FTTW8E9XPD01234", "stock_number": "A004",
            "description": "The revolutionary compact truck that redefined the segment. 42 MPG city, FlexBed utility, and urban-friendly size with genuine truck capability.",
            "features": ["42MPG City Hybrid", "8-inch SYNC 4", "FlexBed System", "USB-C Ports", "Zone Lighting", "FordPass", "Co-Pilot360"],
            "images": ["https://images.unsplash.com/photo-1501066927591-314112b5888e?w=800&q=80"],
            "status": "available", "featured": False, "created_at": now, "updated_at": now
        },
        {
            "title": "2024 Ford Bronco Sport Badlands 4WD",
            "make": "Ford", "model": "Bronco Sport", "year": 2024, "price": 47800, "mileage": 8900,
            "condition": "used", "body_type": "SUV", "fuel_type": "Gas", "transmission": "Automatic",
            "exterior_color": "Eruption Green", "interior_color": "Roast", "engine": "2.0L EcoBoost",
            "drivetrain": "4WD", "doors": 4, "seats": 5, "vin": "3FMCR9D98PRD12345", "stock_number": "A005",
            "description": "Born wild. HOSS 3.0 suspension, 7 G.O.A.T. modes, locking rear differential, and waterproof interior zones. Conquers any terrain.",
            "features": ["HOSS 3.0 Suspension", "7 GOAT Modes", "Trail Turn Assist", "Locking Rear Differential", "Bash Plates", "Mud-Terrain Tires", "Waterproof Interior"],
            "images": ["https://images.unsplash.com/photo-1528824788011-fbb82c9abad3?w=800&q=80", "https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&q=80"],
            "status": "available", "featured": True, "created_at": now, "updated_at": now
        },
        {
            "title": "2022 Ford Ranger Lariat 4WD FX4",
            "make": "Ford", "model": "Ranger", "year": 2022, "price": 38900, "mileage": 32000,
            "condition": "used", "body_type": "Truck", "fuel_type": "Gas", "transmission": "Automatic",
            "exterior_color": "Antimatter Blue", "interior_color": "Black", "engine": "2.3L EcoBoost",
            "drivetrain": "4WD", "doors": 4, "seats": 5, "vin": "1FTER4FH5NLD34567", "stock_number": "A006",
            "description": "Mid-size truck excellence. The Ranger Lariat with FX4 Off-Road Package, heated leather seats, and 7,500 lb tow capacity handles any task.",
            "features": ["FX4 Off-Road Package", "SYNC 4 8in", "Leather Seats", "Heated Front Seats", "Wireless Charging", "B&O Sound", "Trail Control"],
            "images": ["https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80"],
            "status": "available", "featured": False, "created_at": now, "updated_at": now
        },
        {
            "title": "2023 Ford Expedition MAX Limited 4WD",
            "make": "Ford", "model": "Expedition", "year": 2023, "price": 89500, "mileage": 15000,
            "condition": "used", "body_type": "SUV", "fuel_type": "Gas", "transmission": "Automatic",
            "exterior_color": "Star White Metallic", "interior_color": "Sandstone", "engine": "3.5L EcoBoost V6",
            "drivetrain": "4WD", "doors": 4, "seats": 8, "vin": "1FMJU2AT4PEA12345", "stock_number": "A007",
            "description": "The ultimate family hauler. 8-passenger seating, massaging front seats, 15.5-inch SYNC 4A display, and Pro Trailer Backup Assist make every journey extraordinary.",
            "features": ["8-Passenger Seating", "Massaging Front Seats", "15.5in SYNC 4A", "B&O Sound", "Panoramic Vista Roof", "Pro Trailer Backup", "Power Running Boards"],
            "images": ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80"],
            "status": "available", "featured": False, "created_at": now, "updated_at": now
        }
    ]
    await db.vehicles.insert_many(vehicles)
    logger.info(f"Seeded {len(vehicles)} vehicles")


app.include_router(api_router)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
