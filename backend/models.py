from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="CANDIDATE")  # ADMIN, CANDIDATE
    is_active = Column(Boolean, default=True)
    full_name = Column(String, nullable=True)
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    assessments = relationship("Assessment", back_populates="candidate")
    assessment_items = relationship("AssessmentItem", back_populates="candidate")

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    domain = Column(String, nullable=True)
    subscription_plan = Column(String, default="FREE")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    assessments = relationship("Assessment", back_populates="tenant")

class Company(Base):
    __tablename__ = "companies"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    domain = Column(String, nullable=True)
    subscription_plan = Column(String, default="FREE")
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"))
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    password_hash = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

class JobRole(Base):
    __tablename__ = "job_roles"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    title = Column(String)
    description = Column(Text, nullable=True)
    required_games = Column(JSON, default=list)  # List of game IDs
    traits_json = Column(JSON, default=dict)  # Job role traits for game selection
    created_at = Column(DateTime, default=func.now())

    # Relationships
    assessments = relationship("Assessment", back_populates="job_role")

class Game(Base):
    __tablename__ = "games"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, index=True)  # STROOP, NBACK, etc.
    title = Column(String)
    description = Column(Text, nullable=True)
    base_config = Column(JSON, default=dict)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    assessment_items = relationship("AssessmentItem", back_populates="game")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    candidate_id = Column(String, ForeignKey("users.id"))
    job_role_id = Column(String, ForeignKey("job_roles.id"))
    status = Column(String, default="CREATED")  # CREATED, IN_PROGRESS, COMPLETED, EXPIRED
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    total_score = Column(Float, nullable=True)
    integrity_flags = Column(JSON, default=dict)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    tenant = relationship("Tenant", back_populates="assessments")
    candidate = relationship("User", back_populates="assessments")
    job_role = relationship("JobRole", back_populates="assessments")
    assessment_items = relationship("AssessmentItem", back_populates="assessment")

class AssessmentItem(Base):
    __tablename__ = "assessment_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    assessment_id = Column(String, ForeignKey("assessments.id"))
    game_id = Column(String, ForeignKey("games.id"))
    candidate_id = Column(String, ForeignKey("users.id"))
    order_index = Column(Integer)
    timer_seconds = Column(Integer, nullable=True)
    server_started_at = Column(DateTime, nullable=True)
    server_deadline_at = Column(DateTime, nullable=True)
    status = Column(String, default="PENDING")  # PENDING, IN_PROGRESS, COMPLETED
    score = Column(Float, nullable=True)
    metrics_json = Column(JSON, default=dict)
    config_snapshot = Column(JSON, default=dict)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    assessment = relationship("Assessment", back_populates="assessment_items")
    game = relationship("Game", back_populates="assessment_items")
    candidate = relationship("User", back_populates="assessment_items")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    actor_user_id = Column(String, ForeignKey("users.id"))
    action = Column(String)  # LOGIN, LOGOUT, CREATE_ASSESSMENT, etc.
    target_type = Column(String)  # USER, ASSESSMENT, GAME, etc.
    target_id = Column(String)
    payload_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=func.now())

class BlacklistedToken(Base):
    __tablename__ = "blacklisted_tokens"

    id = Column(String, primary_key=True, default=generate_uuid)
    token_jti = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    full_name = Column(String)
    email = Column(String)
    phone = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    skills = Column(JSON, default=list)
    experience_years = Column(Integer, nullable=True)
    education = Column(JSON, default=dict)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())