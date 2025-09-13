from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
import uuid
from database import get_db
from models import Company, AdminUser, AuditLog, BlacklistedToken, User
import os

router = APIRouter()

# Pydantic models
class CompanySignupRequest(BaseModel):
    company_name: str
    admin_full_name: str
    email: EmailStr
    password: str
    domain: str = None

class CompanyLoginRequest(BaseModel):
    email: str
    password: str

class AdminUserCreateRequest(BaseModel):
    company_id: str
    email: EmailStr
    full_name: str
    password: str

class CompanyResponse(BaseModel):
    id: str
    name: str
    email: str
    domain: str = None
    subscription_plan: str
    is_verified: bool
    created_at: datetime

class AdminUserResponse(BaseModel):
    id: str
    company_id: str
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

# Security settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    jti = str(uuid.uuid4())
    to_encode.update({"exp": expire, "jti": jti})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, jti, expire

def log_audit_action(db: Session, actor_id: str, action: str, target_type: str, target_id: str, payload: dict = None):
    audit_log = AuditLog(
        id=str(uuid.uuid4()),
        actor_user_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        payload_json=payload or {}
    )
    db.add(audit_log)
    db.commit()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_admin_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current admin user from JWT token (supports both AdminUser and User with ADMIN role)"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        jti: str = payload.get("jti")
        role: str = payload.get("role")
        
        if email is None or jti is None or role != "ADMIN":
            raise credentials_exception
            
        # Check if token is blacklisted
        blacklisted = db.query(BlacklistedToken).filter(BlacklistedToken.token_jti == jti).first()
        if blacklisted:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been invalidated",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
    except JWTError:
        raise credentials_exception

    # First try to find AdminUser
    admin_user = db.query(AdminUser).filter(AdminUser.email == email).first()
    if admin_user is not None:
        if not admin_user.is_active:
            raise HTTPException(status_code=400, detail="Inactive admin user")
        return admin_user
    
    # If not found as AdminUser, try regular User with ADMIN role
    regular_user = db.query(User).filter(User.email == email).first()
    if regular_user is not None and regular_user.role.upper() == "ADMIN":
        if not regular_user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        return regular_user
    
    # If neither found, raise exception
    raise credentials_exception

@router.post("/company/signup")
async def company_signup(signup_data: CompanySignupRequest, db: Session = Depends(get_db)):
    """Register a new company and create an admin user"""
    
    # Check if company email already exists
    if db.query(Company).filter(Company.email == signup_data.email).first():
        raise HTTPException(status_code=400, detail="Company email already registered")
    
    # Check if admin email already exists
    if db.query(AdminUser).filter(AdminUser.email == signup_data.email).first():
        raise HTTPException(status_code=400, detail="Admin email already registered")
    
    try:
        # Create company
        hashed_password = get_password_hash(signup_data.password)
        company = Company(
            id=str(uuid.uuid4()),
            name=signup_data.company_name,
            email=signup_data.email,
            domain=signup_data.domain,
            password_hash=hashed_password,
            subscription_plan="free",
            settings_json={
                "max_candidates": 10,
                "assessment_time_limit": 60,
                "custom_branding": False
            }
        )
        db.add(company)
        db.flush()  # Get the company ID
        
        # Create admin user
        admin_user = AdminUser(
            id=str(uuid.uuid4()),
            company_id=company.id,
            email=signup_data.email,
            full_name=signup_data.admin_full_name,
            password_hash=hashed_password
        )
        db.add(admin_user)
        db.commit()
        
        # Log registration
        log_audit_action(db, admin_user.id, "COMPANY_SIGNUP", "COMPANY", company.id, {
            "company_name": signup_data.company_name,
            "admin_email": signup_data.email
        })
        
        # Create access token for admin
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token, jti, expire_time = create_access_token(
            data={"sub": admin_user.email, "role": "ADMIN", "company_id": company.id}, 
            expires_delta=access_token_expires
        )
        
        return {
            "message": "Company and admin account created successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "company": {
                "id": company.id,
                "name": company.name,
                "email": company.email,
                "domain": company.domain,
                "subscription_plan": company.subscription_plan,
                "is_verified": company.is_verified
            },
            "admin": {
                "id": admin_user.id,
                "full_name": admin_user.full_name,
                "email": admin_user.email,
                "company_id": admin_user.company_id
            },
            "next_steps": [
                "Verify your company email address",
                "Complete company profile setup",
                "Add your first job roles",
                "Invite team members (if applicable)",
                "Start creating candidate assessments"
            ]
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create company: {str(e)}")

@router.post("/company/login")
async def company_login(login_data: CompanyLoginRequest, db: Session = Depends(get_db)):
    """Login for company (direct company account)"""
    
    company = db.query(Company).filter(Company.email == login_data.email).first()
    if not company or not verify_password(login_data.password, company.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    company.last_login_at = datetime.utcnow()
    db.commit()
    
    # Log login action
    log_audit_action(db, company.id, "COMPANY_LOGIN", "COMPANY", company.id, {"email": company.email})
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token, jti, expires_at = create_access_token(
        data={"sub": company.email, "role": "ADMIN", "company_id": company.id}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": company.id,
            "username": company.email,
            "full_name": company.name,
            "role": "ADMIN",
            "company_name": company.name,
            "domain": company.domain,
            "subscription_plan": company.subscription_plan
        }
    }

@router.post("/admin/login")
async def admin_login(login_data: CompanyLoginRequest, db: Session = Depends(get_db)):
    """Login for admin users"""
    
    admin_user = db.query(AdminUser).filter(AdminUser.email == login_data.email).first()
    if not admin_user or not verify_password(login_data.password, admin_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not admin_user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")
    
    # Get company info
    company = db.query(Company).filter(Company.id == admin_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Update last login
    admin_user.last_login_at = datetime.utcnow()
    db.commit()
    
    # Log login action
    log_audit_action(db, admin_user.id, "ADMIN_LOGIN", "ADMIN_USER", admin_user.id, {"email": admin_user.email})
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token, jti, expires_at = create_access_token(
        data={"sub": admin_user.email, "role": "ADMIN", "company_id": admin_user.company_id}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": admin_user.id,
            "username": admin_user.email,
            "full_name": admin_user.full_name,
            "role": "ADMIN",
            "company_id": admin_user.company_id,
            "company_name": company.name
        }
    }

@router.post("/unified/login")
async def unified_login(login_data: CompanyLoginRequest, db: Session = Depends(get_db)):
    """Unified login endpoint that handles admin users, companies, and candidates"""
    
    # First try admin user login (email-based)
    admin_user = db.query(AdminUser).filter(AdminUser.email == login_data.email).first()
    if admin_user and verify_password(login_data.password, admin_user.password_hash) and admin_user.is_active:
        # Get company info
        company = db.query(Company).filter(Company.id == admin_user.company_id).first()
        
        # Update last login
        admin_user.last_login_at = datetime.utcnow()
        db.commit()
        
        # Log login action
        log_audit_action(db, admin_user.id, "ADMIN_LOGIN", "ADMIN_USER", admin_user.id, {"email": admin_user.email})
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token, jti, expires_at = create_access_token(
            data={"sub": admin_user.email, "role": "ADMIN", "company_id": admin_user.company_id}, 
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": admin_user.id,
                "username": admin_user.email,
                "full_name": admin_user.full_name,
                "role": "ADMIN",
                "company_id": admin_user.company_id,
                "company_name": company.name if company else "Unknown Company"
            }
        }
    
    # Try candidate/user login (email OR username)
    candidate = None
    # First try by email
    candidate = db.query(User).filter(User.email == login_data.email).first()
    # If not found by email, try by username (in case they enter username in email field)
    if not candidate:
        candidate = db.query(User).filter(User.username == login_data.email).first()
    
    if candidate and verify_password(login_data.password, candidate.password_hash) and candidate.is_active:
        # Update last login
        candidate.last_login_at = datetime.utcnow()
        db.commit()
        
        # Log login action
        log_audit_action(db, candidate.id, "CANDIDATE_LOGIN", "USER", candidate.id, {"email": candidate.email})
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token, jti, expires_at = create_access_token(
            data={"sub": candidate.email, "role": candidate.role.upper()}, 
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": candidate.id,
                "username": candidate.username,
                "email": candidate.email,
                "full_name": candidate.full_name,
                "role": candidate.role.upper(),
                "job_role_id": candidate.job_role_id
            }
        }
    
    # If candidate login fails, try company login
    company = db.query(Company).filter(Company.email == login_data.email).first()
    if company and verify_password(login_data.password, company.password_hash):
        # Update last login
        company.last_login_at = datetime.utcnow()
        db.commit()
        
        # Log login action
        log_audit_action(db, company.id, "COMPANY_LOGIN", "COMPANY", company.id, {"email": company.email})
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token, jti, expires_at = create_access_token(
            data={"sub": company.email, "role": "ADMIN", "company_id": company.id}, 
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": company.id,
                "username": company.email,
                "full_name": company.name,
                "role": "ADMIN",
                "company_name": company.name,
                "domain": company.domain,
                "subscription_plan": company.subscription_plan
            }
        }
    
    # If all fail, return error
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email/username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
