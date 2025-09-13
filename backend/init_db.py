#!/usr/bin/env python3
"""
Database initialization script for Cognihire
Creates all database tables and populates with initial data
"""

from database import engine, SessionLocal
from models import Base
import os
import sys

def init_database():
    """Initialize the database by creating all tables"""
    try:
        print("Creating database tables...")

        # Create all tables
        Base.metadata.create_all(bind=engine)

        print("✅ Database tables created successfully!")

        # Create a session to add initial data
        db = SessionLocal()

        try:
            # Check if we need to add initial data
            from models import User, Tenant, Company, AdminUser, Game
            from sqlalchemy.orm import Session

            # Check if admin user exists
            admin_user = db.query(User).filter(User.username == "admin@cognihire.com").first()
            if not admin_user:
                print("Creating default admin user...")

                # Create default tenant
                default_tenant = Tenant(
                    name="Default Organization",
                    domain="cognihire.com",
                    subscription_plan="ENTERPRISE"
                )
                db.add(default_tenant)
                db.flush()

                # Create admin user
                from passlib.context import CryptContext
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

                admin_user = User(
                    username="admin@cognihire.com",
                    email="admin@cognihire.com",
                    password_hash=pwd_context.hash("admin123"),
                    role="ADMIN",
                    full_name="System Administrator",
                    is_active=True
                )
                db.add(admin_user)

                # Create default games
                games_data = [
                    {"code": "STROOP", "title": "Stroop Test", "description": "Test of cognitive flexibility and attention"},
                    {"code": "NBACK", "title": "N-Back Task", "description": "Test of working memory"},
                    {"code": "REACTION_TIME", "title": "Reaction Time", "description": "Test of processing speed"},
                    {"code": "PATTERN_RECOGNITION", "title": "Pattern Recognition", "description": "Test of spatial reasoning"},
                    {"code": "LOGIC_GAME", "title": "Logic Game", "description": "Test of logical reasoning"}
                ]

                for game_data in games_data:
                    game = Game(**game_data)
                    db.add(game)

                db.commit()
                print("✅ Default admin user and games created!")
                print("   Username: admin@cognihire.com")
                print("   Password: admin123")
            else:
                print("✅ Admin user already exists")

        except Exception as e:
            print(f"⚠️  Error creating initial data: {e}")
            db.rollback()
        finally:
            db.close()

    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("🚀 Initializing Cognihire Database...")
    init_database()
    print("🎉 Database initialization complete!")