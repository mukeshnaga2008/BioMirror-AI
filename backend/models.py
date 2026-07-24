from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
import datetime

Base = declarative_base()

class DbUser(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    gender = Column(String, default="Male")
    age = Column(Integer, default=24)
    height = Column(Float, default=178)
    weight = Column(Float, default=76)
    blood_group = Column(String, default="O+")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    reports = relationship("DbReport", back_populates="user")
    doctor_shares = relationship("DbDoctorShare", back_populates="user")

class DbReport(Base):
    __tablename__ = 'reports'
    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String)
    file_path = Column(String)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="completed") # processing, completed

    user = relationship("DbUser", back_populates="reports")
    biomarkers = relationship("DbBiomarker", back_populates="report")

class DbBiomarker(Base):
    __tablename__ = 'biomarkers'
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String, ForeignKey('reports.id'))
    name = Column(String)
    value = Column(Float)
    unit = Column(String)
    status = Column(String) # normal, low, high, borderline
    reference_range = Column(String)
    organ = Column(String)
    description = Column(String)

    report = relationship("DbReport", back_populates="biomarkers")

class DbDoctorShare(Base):
    __tablename__ = 'doctor_shares'
    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    doctor_name = Column(String)
    specialty = Column(String)
    email = Column(String)
    permissions = Column(String) # comma-separated
    duration = Column(String)
    token = Column(String, unique=True)
    status = Column(String, default="active") # active, expired
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("DbUser", back_populates="doctor_shares")

# Database initialization helper
DATABASE_URL = "sqlite:///./biomirror.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
