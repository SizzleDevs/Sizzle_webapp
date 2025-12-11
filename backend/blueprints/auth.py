from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
import logging

from ..data import load_user_data, save_user_data
from ..extensions import bcrypt

auth_bp = Blueprint('auth_bp', __name__)




@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        logging.info(f"Login attempt for user: {data.get('username')}")
        username = data.get('username')
        password = data.get('password')
        users = load_user_data()
        
        if username in users and bcrypt.check_password_hash(users[username]['password'], password):
            logging.info(f"Login successful for user: {username}")
            access_token = create_access_token(identity=username)
            return jsonify({
                "message": "Login successful!",
                "token": access_token,
                "username": username
            }), 200
        else:
            logging.warning(f"Invalid login attempt for user: {username}")
            return jsonify({"message": "Invalid username or password!"}), 401
    except Exception as e:
        logging.exception("An error occurred during login")
        return jsonify({"message": "An internal server error occurred"}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        logging.info(f"Registration attempt for user: {data.get('username')}")
        username = data.get('username')
        password = data.get('password')
        
        users = load_user_data()
        if username in users:
            logging.warning(f"Registration attempt for existing user: {username}")
            return jsonify({"message": "Username already exists!"}), 409

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        users[username] = {
            "password": hashed_password,
            "name": data.get("name"),
            "tags": data.get("tags"),
            "favorites": []
        }
        save_user_data(users)
        
        access_token = create_access_token(identity=username)
        logging.info(f"User {username} registered successfully")
        return jsonify({
            "message": "User registered successfully!",
            "token": access_token,
            "username": username
        }), 201
    except Exception as e:
        logging.exception("An error occurred during registration")
        return jsonify({"message": "An internal server error occurred"}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user = get_jwt_identity()
        users = load_user_data()
        user_data = users.get(current_user)
        if user_data:
            profile_data = {
                "username": current_user,
                "name": user_data.get("name"),
                "tags": user_data.get("tags"),
                "favorites": user_data.get("favorites")
            }
            logging.info(f"Fetched profile for user: {current_user}")
            return jsonify(profile_data), 200
        else:
            return jsonify({"message": "User not found"}), 404
    except Exception as e:
        logging.exception(f"An error occurred while fetching profile for user: {current_user}")
        return jsonify({"message": "An internal server error occurred"}), 500

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user = get_jwt_identity()
        users = load_user_data()
        
        if current_user not in users:
            return jsonify({"message": "User not found"}), 404

        data = request.json
        
        if 'name' in data:
            users[current_user]['name'] = data['name']
            logging.info(f"User {current_user} updated their name.")

        if 'password' in data and data['password']:
            users[current_user]['password'] = bcrypt.generate_password_hash(data['password']).decode('utf-8')
            logging.info(f"User {current_user} updated their password.")
        
        save_user_data(users)
        
        updated_user_data = users[current_user]
        profile_data = {
            "username": current_user,
            "name": updated_user_data.get("name"),
            "tags": updated_user_data.get("tags"),
            "favorites": updated_user_data.get("favorites")
        }

        return jsonify(profile_data), 200

    except Exception as e:
        logging.exception(f"An error occurred while updating profile for user: {current_user}")
        return jsonify({"message": "An internal server error occurred"}), 500

@auth_bp.route('/me', methods=['DELETE'])
@jwt_required()
def delete_account():
    try:
        current_user = get_jwt_identity()
        password = request.json.get('password', None)
        
        users = load_user_data()

        if not password or not bcrypt.check_password_hash(users.get(current_user, {}).get('password'), password):
            logging.warning(f"Incorrect password for account deletion attempt for user: {current_user}")
            return jsonify({"message": "Incorrect password"}), 401
        
        if current_user in users:
            del users[current_user]
            save_user_data(users)
            logging.info(f"Account for user {current_user} deleted successfully")
            return jsonify({"message": "Account successfully deleted"}), 200
        else:
            return jsonify({"message": "User not found"}), 404
            
    except Exception as e:
        logging.exception(f"An error occurred during account deletion for user: {current_user}")
        return jsonify({"message": "An internal server error occurred"}), 500
