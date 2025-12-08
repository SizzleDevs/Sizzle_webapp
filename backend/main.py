from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import json

import logging

from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager

logging.basicConfig(filename='/home/thijmen/.gemini/tmp/2bf9bd0c995e50f4676739552b338adc74f2e03a3f395a078d13ce65bfdec620/backend.log', level=logging.DEBUG)

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super-secret-key-change-me"  # Change this in your production environment
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


def load_user_data():
    try:
        if os.path.exists("credentials.json"):
            with open("credentials.json", "r") as file:
                return json.load(file)
        return {}
    except Exception as e:
        logging.exception("Error loading user data")
        return {}

def save_user_data(data):
    try:
        with open("credentials.json", "w") as file:
            json.dump(data, file, indent=4)
    except Exception as e:
        logging.exception("Error saving user data")

@app.route('/')
def index():
    logging.info("Root endpoint was hit")
    return "Welcome to the Sizzle API!"

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        logging.info(f"Login attempt for user: {data.get('username')}")
        username = data.get('username')
        password = data.get('password')
        users = load_user_data()
        
        if username in users and users[username]['password'] == password:
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

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        logging.info(f"Registration attempt for user: {data.get('username')}")
        username = data.get('username')
        
        users = load_user_data()
        if username in users:
            logging.warning(f"Registration attempt for existing user: {username}")
            return jsonify({"message": "Username already exists!"}), 409

        users[username] = {
            "password": data.get("password"),
            "name": data.get("name"),
            "tags": data.get("tags"),
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

@app.route('/api/auth/me', methods=['DELETE'])
@jwt_required()
def delete_account():
    try:
        current_user = get_jwt_identity()
        password = request.json.get('password', None)

        users = load_user_data()

        if not password or users[current_user]['password'] != password:
            logging.warning(f"Incorrect password for account deletion attempt for user: {current_user}")
            return jsonify({"message": "Incorrect password"}), 401
        
        del users[current_user]
        save_user_data(users)
        
        logging.info(f"Account for user {current_user} deleted successfully")
        return jsonify({"message": "Account successfully deleted"}), 200
    except Exception as e:
        logging.exception(f"An error occurred during account deletion for user: {current_user}")
        return jsonify({"message": "An internal server error occurred"}), 500

@app.errorhandler(404)
def not_found(error):
    logging.warning(f"404 error at path: {request.path}")
    return jsonify({"error": "Not Found"}), 404

if __name__ == '__main__':
    try:
        app.run(debug=True)
    except Exception as e:
        logging.exception("Failed to start the Flask application")
        raise e
