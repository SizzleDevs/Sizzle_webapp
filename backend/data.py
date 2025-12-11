import json
import os
import logging

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
        # Corrected path to be relative to the project root
        with open("backend/recepten.json", "r") as file:
            return json.load(file)
    except Exception as e:
        logging.exception("Error loading recipe data")
        return []
