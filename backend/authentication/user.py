from alchemy import getDb, getBcrypt
from flask_login import  UserMixin
from datetime import datetime
db = getDb()
bcrypt = getBcrypt()

class User(UserMixin, db.Model):
    # Primary key
    id         = db.Column(db.Integer, primary_key=True)
    email      = db.Column(db.String(60), unique=True, index=True)
    password   = db.Column(db.String(80))
    
    name       = db.Column(db.String(80), nullable=False)
    account_created = db.Column(db.Date, nullable=True)
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    @classmethod
    def create_user(cls, name, email, password):
        user = cls( name     = name.strip(),
                    email    = email.strip(),
                    password = bcrypt.generate_password_hash(password).decode('utf-8'),
                    account_created     = datetime.now())
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def get_by_id(id):
        return User.query.filter_by(id=id).first()

    @staticmethod
    def get_by_email(email):
        return User.query.filter_by(email=email.strip()).first()
  
    @staticmethod
    def email_exists(email):
        email = User.query.filter_by(email=email).first()
        return email is not None
