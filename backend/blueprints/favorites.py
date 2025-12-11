from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
import logging

from ..data import load_user_data, save_user_data, load_recipe_data

favorites_bp = Blueprint('favorites_bp', __name__)



@favorites_bp.route('/', methods=['GET'])
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

@favorites_bp.route('/<receptId>', methods=['POST'])
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

@favorites_bp.route('/<receptId>', methods=['DELETE'])
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
