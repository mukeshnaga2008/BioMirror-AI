from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import datetime
import smtplib
from email.mime.text import MIMEText
import os
import base64
import hmac
import hashlib
import json

from models import init_db, SessionLocal, DbUser, DbReport, DbBiomarker, DbDoctorShare
from ai_engine import parse_report_and_reason

# Load environment configurations
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
JWT_SECRET = os.getenv("JWT_SECRET", "biomirror_super_secret_key_10.0")

app = FastAPI(title="BioMirror AI API Gateway", version="11.0")

# Enable CORS for frontend Vite application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# HS256 JWT Utilities
def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').replace('=', '')

def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def encode_jwt(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = base64url_encode(json.dumps(payload).encode('utf-8'))
    signature = hmac.new(JWT_SECRET.encode('utf-8'), f"{header_b64}.{payload_b64}".encode('utf-8'), hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_jwt(token: str) -> dict:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return {}
        header_b64, payload_b64, signature_b64 = parts
        expected_sig = hmac.new(JWT_SECRET.encode('utf-8'), f"{header_b64}.{payload_b64}".encode('utf-8'), hashlib.sha256).digest()
        if not hmac.compare_digest(base64url_decode(signature_b64), expected_sig):
            return {}
        payload = json.loads(base64url_decode(payload_b64).decode('utf-8'))
        return payload
    except Exception:
        return {}

def get_current_user_email(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized session")
    token = authorization.split(" ")[1]
    payload = decode_jwt(token)
    if not payload or "email" not in payload:
        raise HTTPException(status_code=401, detail="Invalid session token")
    return payload["email"]

# In-Memory Active OTP Cache
# maps email -> {"otp": str, "expires": datetime}
active_otps = {}

# Schemas
class OtpRequest(BaseModel):
    email: str
    purpose: str # register, login, reset

class OtpVerify(BaseModel):
    email: str
    otp: str

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    gender: str
    age: int
    height: float
    weight: float
    bloodGroup: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    password: str
    otp: str

class ShareConfig(BaseModel):
    doctorName: str
    specialty: str
    email: str
    permissions: List[str]
    duration: str

class SimulationInput(BaseModel):
    exercise: int
    sleep: float
    water: float
    diet: str
    stress: str

# Auth Routes
@app.post("/api/v1/auth/request-otp")
def request_otp(req: OtpRequest):
    otp_code = str(hash(req.email + str(datetime.datetime.utcnow().timestamp())) % 900000 + 100000)
    # 10 minutes expiry
    expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    active_otps[req.email] = {"otp": otp_code, "expires": expiry}

    email_sent = False
    if SMTP_HOST and SMTP_USER and SMTP_PASSWORD:
        try:
            msg = MIMEText(f"Your BioMirror AI Secure Verification Code is: {otp_code}\nThis code expires in 10 minutes.")
            msg['Subject'] = 'BioMirror AI OTP Verification'
            msg['From'] = SMTP_USER
            msg['To'] = req.email

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, [req.email], msg.as_string())
            email_sent = True
        except Exception as e:
            print(f"SMTP failed, printing to terminal: {e}")

    print(f"\n========================================\n[BIOMIRROR AI OTP] {req.purpose.upper()} token for {req.email}: {otp_code}\n========================================\n")
    return {"message": "Verification token transmitted", "emailSent": email_sent, "simulatedOtp": otp_code}

@app.post("/api/v1/auth/verify-otp")
def verify_otp(req: OtpVerify):
    if req.email not in active_otps:
        raise HTTPException(status_code=400, detail="No verification requested")
    cached = active_otps[req.email]
    if datetime.datetime.utcnow() > cached["expires"]:
        raise HTTPException(status_code=400, detail="Verification token expired")
    if cached["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    
    # generate JWT
    payload = {"email": req.email, "exp": (datetime.datetime.utcnow() + datetime.timedelta(days=7)).timestamp()}
    token = encode_jwt(payload)
    return {"token": token}

@app.post("/api/v1/auth/register")
def register(user: UserRegister, db = Depends(get_db)):
    db_user = db.query(DbUser).filter(DbUser.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = DbUser(
        name=user.name,
        email=user.email,
        password_hash=user.password, # simple hashing mock
        gender=user.gender,
        age=user.age,
        height=user.height,
        weight=user.weight,
        blood_group=user.bloodGroup
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # generate JWT
    payload = {"email": user.email, "exp": (datetime.datetime.utcnow() + datetime.timedelta(days=7)).timestamp()}
    token = encode_jwt(payload)
    return {"user": new_user, "token": token}

@app.post("/api/v1/auth/reset-password")
def reset_password(req: ResetPasswordRequest, db = Depends(get_db)):
    if req.email not in active_otps or active_otps[req.email]["otp"] != req.otp:
         raise HTTPException(status_code=400, detail="Invalid or expired OTP token")
    user = db.query(DbUser).filter(DbUser.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
    user.password_hash = req.password
    db.commit()
    return {"message": "Password reset complete"}

@app.get("/api/v1/users/me")
def read_current_user(email: str = Depends(get_current_user_email), db = Depends(get_db)):
    user = db.query(DbUser).filter(DbUser.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Emergency SOS Mode Status & Toggle
emergency_active_users = set()

@app.post("/api/v1/sos/toggle")
def toggle_sos(email: str = Depends(get_current_user_email)):
    if email in emergency_active_users:
        emergency_active_users.remove(email)
        active = False
    else:
        emergency_active_users.add(email)
        active = True
    return {"active": active}

@app.get("/api/v1/sos/status")
def get_sos_status(email: str = Depends(get_current_user_email)):
    return {"active": email in emergency_active_users}

@app.get("/api/v1/sos/report/{token}")
def get_sos_report(token: str, db = Depends(get_db)):
    # token will look like 'sos-{email}'
    if not token.startswith("sos-"):
        raise HTTPException(status_code=400, detail="Invalid SOS token")
    email = token.replace("sos-", "")
    if email not in emergency_active_users:
        raise HTTPException(status_code=403, detail="Access Denied. SOS Mode is inactive. Patient clinical metadata is securely encrypted.")
    
    user = db.query(DbUser).filter(DbUser.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Patient record not found")
    
    # Collect biomarkers
    reports = db.query(DbReport).filter(DbReport.user_id == user.id).all()
    report_ids = [r.id for r in reports]
    biomarkers = db.query(DbBiomarker).filter(DbBiomarker.report_id.in_(report_ids)).all() if report_ids else []
    
    return {
        "user": user,
        "biomarkers": biomarkers,
        "emergencyContact": {
            "name": "John Doe",
            "relation": "Friend",
            "phone": "+91 98765 43210"
        },
        "allergies": ["Penicillin"],
        "medications": ["Vitamin D Supplement"]
    }

# Clinical / Reports Endpoint
@app.post("/api/v1/reports")
def upload_medical_report(file: UploadFile = File(...), email: str = Depends(get_current_user_email), db = Depends(get_db)):
    user = db.query(DbUser).filter(DbUser.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
        
    report_id = f"rep-{uuid.uuid4().hex[:8]}"
    db_report = DbReport(
        id=report_id,
        user_id=user.id,
        name=file.filename,
        file_path=f"storage/{file.filename}",
        status="completed"
    )
    db.add(db_report)
    
    biomarkers = parse_report_and_reason(file.filename)
    for bio in biomarkers:
        db_bio = DbBiomarker(
            report_id=report_id,
            name=bio["name"],
            value=bio["value"],
            unit=bio["unit"],
            status=bio["status"],
            reference_range=bio["reference_range"],
            organ=bio["organ"],
            description=bio["description"]
        )
        db.add(db_bio)
        
    db.commit()
    return {"message": "Report uploaded and parsed successfully", "reportId": report_id, "biomarkers": biomarkers}

@app.post("/api/v1/doctor/share")
def create_doctor_share(config: ShareConfig, email: str = Depends(get_current_user_email), db = Depends(get_db)):
    user = db.query(DbUser).filter(DbUser.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    token = f"bm_sec_{uuid.uuid4().hex[:12]}"
    new_share = DbDoctorShare(
        id=f"share-{uuid.uuid4().hex[:6]}",
        user_id=user.id,
        doctor_name=config.doctorName,
        specialty=config.specialty,
        email=config.email,
        permissions=",".join(config.permissions),
        duration=config.duration,
        token=token
    )
    db.add(new_share)
    db.commit()
    return {"token": token, "shareUrl": f"https://biomirror.ai/doctor/access/{token}"}

@app.post("/api/v1/simulation")
def simulate_lifestyle_impact(inputs: SimulationInput):
    score = 80
    score += inputs.exercise * 2.5
    if 7.0 <= inputs.sleep <= 9.0:
        score += 8
    elif 6.0 <= inputs.sleep < 7.0:
        score += 4
    score += min(6.0, inputs.water * 2.0)
    
    if inputs.diet == "clean":
        score += 10
    elif inputs.diet == "average":
        score += 5
        
    if inputs.stress == "low":
        score += 5
    elif inputs.stress == "moderate":
        score += 2
        
    score = min(100, int(score))
    return {
        "simulatedHealthScore": score,
        "organOutlook": {
            "heart": "Improving" if inputs.exercise >= 3 else "Stable",
            "bones": "Stabilizing" if inputs.diet == "clean" else "Stable"
        }
    }

import random

@app.post("/api/v1/simulation/optimize")
def optimize_lifestyle_interventions():
    diets = ['poor', 'average', 'clean']
    stresses = ['high', 'moderate', 'low']
    results = []
    
    for _ in range(1000):
        ex = random.randint(0, 7)
        sl = round(random.uniform(4.0, 10.0), 1)
        wt = round(random.uniform(1.0, 4.0), 1)
        dt = random.choice(diets)
        st = random.choice(stresses)
        
        cardio = 50 + (ex * 5) - (20 if st == 'high' else 5 if st == 'moderate' else 0) + (15 if 7.0 <= sl <= 8.5 else 0)
        hepatic = 40 + (25 if dt == 'clean' else 10 if dt == 'average' else 0) + (wt * 6) - (15 if st == 'high' else 0)
        bone = 40 + (ex * 6) + (20 if dt == 'clean' else 5 if dt == 'average' else 0) + (10 if 7.0 <= sl <= 9.0 else 0)
        
        overall = (cardio + hepatic + bone) / 3.0
        
        results.append({
            "exercise": ex,
            "sleep": sl,
            "water": wt,
            "diet": dt,
            "stress": st,
            "cardio": min(100, int(cardio)),
            "hepatic": min(100, int(hepatic)),
            "bone": min(100, int(bone)),
            "score": min(100, int(overall))
        })
        
    best_overall = max(results, key=lambda x: x["score"])
    best_hepatic = max([r for r in results if r["diet"] == "clean" and r["water"] >= 2.5], key=lambda x: x["hepatic"])
    best_cardio = max([r for r in results if r["exercise"] >= 4 and r["stress"] != "high"], key=lambda x: x["cardio"])
    
    return {
        "strategies": [
            {
                "name": "Cardiovascular Longevity Plan",
                "score": best_cardio["score"],
                "riskReduction": "34% Cardiovascular Risk Reduction",
                "color": "cyan",
                "lifestyle": {
                    "exercise": best_cardio["exercise"],
                    "sleep": best_cardio["sleep"],
                    "water": best_cardio["water"],
                    "diet": best_cardio["diet"],
                    "stress": best_cardio["stress"]
                },
                "details": f"Optimizes arterial elasticity. Cardio Index projected to reach {best_cardio['cardio']}%."
            },
            {
                "name": "Hepatic Recovery Strategy",
                "score": best_hepatic["score"],
                "riskReduction": "42% Hepatic Enzyme Normalization",
                "color": "emerald",
                "lifestyle": {
                    "exercise": best_hepatic["exercise"],
                    "sleep": best_hepatic["sleep"],
                    "water": best_hepatic["water"],
                    "diet": best_hepatic["diet"],
                    "stress": best_hepatic["stress"]
                },
                "details": f"Focuses on liver clearance. Hepatic Index projected to reach {best_hepatic['hepatic']}%."
            },
            {
                "name": "Osteo-Skeletal Density Plan",
                "score": best_overall["score"],
                "riskReduction": "28% Bone Metabolic Strength Increase",
                "color": "amber",
                "lifestyle": {
                    "exercise": best_overall["exercise"],
                    "sleep": best_overall["sleep"],
                    "water": best_overall["water"],
                    "diet": best_overall["diet"],
                    "stress": best_overall["stress"]
                },
                "details": f"Focuses on osteoblast stimulation. Bone Index projected to reach {best_overall['bone']}%."
            }
        ]
    }
