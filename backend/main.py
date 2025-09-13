from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, admin, assessments, games, company_auth, job_roles

# Create FastAPI app
app = FastAPI(
    title="Cognihire API",
    description="Cognitive Assessment Platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(assessments.router, prefix="/assessments", tags=["Assessments"])
app.include_router(games.router, prefix="/games", tags=["Games"])
app.include_router(company_auth.router, prefix="/auth/company", tags=["Company Auth"])
app.include_router(job_roles.router, prefix="/job-roles", tags=["Job Roles"])

@app.get("/")
async def root():
    return {"message": "Cognihire API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}