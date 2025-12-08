from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import json

import logging

from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager

logging.basicConfig(filename='/home/thijmen/.gemini/tmp/2bf9bd0c995e50f4676739552b338adc74f2e03a3f395a078d13ce65bfdec620/backend.log', level=logging.DEBUG)

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super-secret-key-change-me"  # Change this in your production environment
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


def load_user_data():
    try:
        if os.path.exists("credentials.json") and os.path.getsize("credentials.json") > 0:
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

def load_recipe_data():
    try:
        with open("backend/recepten.json", "r") as file:
            return json.load(file)
    except Exception as e:
        logging.exception("Error loading recipe data")
        return []

@app.route('/')
def index():
    logging.info("Root endpoint was hit")
    return "Welcome to the Sizzle API!"

@app.route('/api/recepten', methods=['GET'])
def get_recipes():
    try:
        logging.info("Request for all recipes")
        recipes = load_recipe_data()
        return jsonify(recipes), 200
    except Exception as e:
        logging.exception("An error occurred while fetching recipes")
        return jsonify({"message": "An internal server error occurred"}), 500

@app.route('/api/recepten/<id>', methods=['GET'])
def get_recipe_detail(id):
    try:
        logging.info(f"Request for recipe with id: {id}")
        recipe_path = os.path.join('backend', 'recepten_database', f'{id}.json')
        if os.path.exists(recipe_path):
            with open(recipe_path, 'r') as file:
                recipe = json.load(file)
            return jsonify(recipe), 200
        else:
            logging.warning(f"Recipe with id {id} not found")
            return jsonify({"message": "Recipe not found"}), 404
    except Exception as e:
        logging.exception(f"An error occurred while fetching recipe with id: {id}")
        return jsonify({"message": "An internal server error occurred"}), 500

@app.route('/api/auth/login', methods=['POST'])
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

@app.route('/api/auth/register', methods=['POST'])
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

@app.route('/api/favorieten', methods=['GET'])
@jwt_required()
def get_favorites():
    try:
        current_user = get_jwt_identity()
        users = load_user_data()
        favorite_ids = users.get(current_user, {}).get('favorites', [])
        
        all_recipes = load_recipe_data()
        favorite_recipes = [recipe for recipe in all_recipes if recipe['id'] in favorite_ids]
        
        logging.info(f"Fetched favorites for user: {current_user}")
        return jsonify(favorite_recipes), 200
    except Exception as e:
        logging.exception(f"An error occurred while fetching favorites for user: {current_user}")
        return jsonify({"message": "An internal server error occurred"}), 500

@app.route('/api/favorieten/<receptId>', methods=['POST'])
@jwt_required()
def add_favorite(receptId):
    try:
        current_user = get_jwt_identity()
        users = load_user_data()
        if current_user in users:
            if receptId not in users[current_user]['favorites']:
                users[current_user]['favorites'].append(receptId)
                save_user_data(users)
                logging.info(f"User {current_user} added recipe {receptId} to favorites")
                return jsonify({"message": "Recipe added to favorites"}), 201
            else:
                logging.warning(f"User {current_user} tried to add recipe {receptId} which is already a favorite")
                return jsonify({"message": "Recipe already in favorites"}), 409
        else:
            return jsonify({"message": "User not found"}), 404
    except Exception as e:
        logging.exception(f"An error occurred while adding favorite for user: {current_user}")
        return jsonify({"message": "An internal server error occurred"}), 500

@app.route('/api/favorieten/<receptId>', methods=['DELETE'])
@jwt_required()
def remove_favorite(receptId):
    try:
        current_user = get_jwt_identity()
        users = load_user_data()
        if current_user in users:
            if receptId in users[current_user]['favorites']:
                users[current_user]['favorites'].remove(receptId)
                save_user_data(users)
                logging.info(f"User {current_user} removed recipe {receptId} from favorites")
                return jsonify({"message": "Recipe removed from favorites"}), 200
            else:
                logging.warning(f"User {current_user} tried to remove recipe {receptId} which is not a favorite")
                return jsonify({"message": "Recipe not in favorites"}), 404
        else:
            return jsonify({"message": "User not found"}), 404
    except Exception as e:
        logging.exception(f"An error occurred while removing favorite for user: {current_user}")
        return jsonify({"message": "An internal server error occurred"}), 500

@app.route('/api/auth/me', methods=['GET'])
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

@app.route('/api/auth/me', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user = get_jwt_identity()
        users = load_user_data()
        
        if current_user not in users:
            return jsonify({"message": "User not found"}), 404

        data = request.json
        
        # Update name if provided
        if 'name' in data:
            users[current_user]['name'] = data['name']
            logging.info(f"User {current_user} updated their name.")

        # Update password if provided
        if 'password' in data and data['password']:
            # In a real app, you'd want to verify the old password first
            # For simplicity here, we'll just update it.
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

@app.route('/api/auth/me', methods=['DELETE'])
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
