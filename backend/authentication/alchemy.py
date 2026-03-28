from flask_sqlalchemy import SQLAlchemy
import os
from flask import Flask
from flask_login import LoginManager,  AnonymousUserMixin
from flask_bcrypt import Bcrypt
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///surveys.db')
app.config['SECRET_KEY'] = "7yzuh0&b=rK"
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['WTF_CSRF_ENABLED'] = False

CORS(app, 
     resources={r"/*": {
         "origins": ["http://localhost:8080"],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
         "supports_credentials": True,
         "expose_headers": ["Content-Type", "Authorization"]
     }})

db = SQLAlchemy(app)

bcrypt = Bcrypt(app)

#https://stackoverflow.com/questions/19274226/how-do-you-track-the-current-user-in-flask-login
class Anonymous(AnonymousUserMixin):
  def __init__(self):
    self.id = 0
    
login_manager = LoginManager(app)
login_manager.login_view = 'logIn'
login_manager.session_protection = None  # Changed from 'strong' to None for CORS
login_manager.anonymous_user = Anonymous



def getDb():
    return db

def getApp():
    return app

def getBcrypt():
    return bcrypt

def getLoginManager():
    return login_manager