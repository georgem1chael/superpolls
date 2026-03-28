from flask import jsonify, request, session
from flask_login import login_user, logout_user, login_required, current_user

from alchemy import getDb, getApp, getLoginManager
from user import User

db = getDb()
app = getApp()
login_manager = getLoginManager()


with app.app_context():
    db.create_all()

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

############################################################################################
#####################################User Managment#########################################
############################################################################################


@login_manager.user_loader
def load_user_from_id(id):
    return User.get_by_id(id)


@app.route("/users/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return "", 200
    
    if current_user.is_authenticated:
        logout_user()
    
    data = request.get_json()
    if not data or "email" not in data or "name" not in data or "password" not in data:
        return jsonify({"error": "Missing data field"}), 400
    
    if User.get_by_email(data["email"].strip()):
        return jsonify({"error": "Email already exists"}), 400
    
    user = User.create_user(
        name=data["name"].strip(),
        email=data["email"].strip(),
        password=data["password"].strip()
    )
    db.session.add(user)
    db.session.commit()
    login_user(user)
    session['user_name'] = data["name"].strip()
    return jsonify(user.name), 201


@app.route("/users/current", methods=["GET", "OPTIONS"])
def get_current_user():
    if request.method == "OPTIONS":
        return "", 200
    
    if not current_user.is_authenticated:
        return jsonify({"error": "Not authenticated"}), 401

    return jsonify({
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }), 200


@app.route("/users/logIn", methods=["POST", "OPTIONS"])
def logIn():
    if request.method == "OPTIONS":
        return "", 200
    
    if current_user.is_authenticated:
        logout_user()
    
    data = request.get_json()
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Missing fields"}), 400
    
    user = User.get_by_email(data["email"].strip())
    if not user or not user.check_password(data["password"].strip()):
        return jsonify({"error": "Invalid credentials"}), 401
    
    login_user(user, remember=data.get("remember", False))
    session['user_name'] = user.name
    return jsonify(user.name), 200


@app.route("/users/logout", methods=["GET"])
@login_required
def logout():
    logout_user()
    session.pop('user_name')
    return "", 200