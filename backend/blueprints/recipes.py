from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
import logging
import os
import random

from ..data import load_user_data, load_recipe_data

recipes_bp = Blueprint('recipes_bp', __name__)



@recipes_bp.route('/', methods=['GET'])
def get_recipes():
    try:
        logging.info("Request for all recipes")
        recipes = load_recipe_data()
        return jsonify(recipes), 200
    except Exception as e:
        logging.exception("An error occurred while fetching recipes")
        return jsonify({"message": "An internal server error occurred"}), 500

@recipes_bp.route('/<id>', methods=['GET'])
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

@recipes_bp.route('/<id>/ask', methods=['POST'])
def ask_ai_about_recipe(id):
    try:
        data = request.json
        question = data.get('question')

        if not question:
            return jsonify({"message": "No question provided."}), 400

        logging.info(f"AI question about recipe {id}: '{question}'")

        recipe_path = os.path.join('backend', 'recepten_database', f'{id}.json')
        if not os.path.exists(recipe_path):
            return jsonify({"message": "Recipe not found"}), 404
        
        with open(recipe_path, 'r') as file:
            recipe = json.load(file)

        mock_answer = f"This is a mocked answer regarding '{recipe['titel']}'. You asked: '{question}'"
        
        return jsonify({"answer": mock_answer}), 200

    except Exception as e:
        logging.exception(f"An error occurred while handling AI question for recipe id: {id}")
        return jsonify({"message": "An internal server error occurred"}), 500

@recipes_bp.route('/aanbevelingen', methods=['GET'])
@jwt_required(optional=True)
def get_recommendations():
    try:
        current_user = get_jwt_identity()
        users = load_user_data()
        user_tags = users.get(current_user, {}).get('tags', []) if current_user else []

        all_recipes = load_recipe_data()
        
        voorkeur_recipes = [r for r in all_recipes if any(tag in r['tags'] for tag in user_tags)]
        if not voorkeur_recipes:
             voorkeur_recipes = random.sample(all_recipes, min(len(all_recipes), 5))
        else:
            voorkeur_recipes = random.sample(voorkeur_recipes, min(len(voorkeur_recipes), 5))

        avondeten_recipes = [r for r in all_recipes if 'Avondeten' in r['tags']]
        if not avondeten_recipes:
            avondeten_recipes = random.sample(all_recipes, min(len(all_recipes), 5))
        else:
            avondeten_recipes = random.sample(avondeten_recipes, min(len(avondeten_recipes), 5))

        trending_recipes = random.sample(all_recipes, min(len(all_recipes), 5))

        recommendations = {
            "voorkeur": voorkeur_recipes,
            "avondeten": avondeten_recipes,
            "trending": trending_recipes
        }
        
        logging.info("Recommendations generated and sent.")
        return jsonify(recommendations), 200

    except Exception as e:
        logging.exception("An error occurred while generating recommendations")
        all_recipes = load_recipe_data()
        
        recommendations = {
            "voorkeur": random.sample(all_recipes, min(len(all_recipes), 5)),
            "avondeten": random.sample(all_recipes, min(len(all_recipes), 5)),
            "trending": random.sample(all_recipes, min(len(all_recipes), 5))
        }
        return jsonify(recommendations), 200
