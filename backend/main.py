from flask import Flask, jsonify, request
from flask_cors import CORS
import logging

# Import extensions
from .extensions import jwt, bcrypt

# Import Blueprints
from .blueprints.auth import auth_bp
from .blueprints.recipes import recipes_bp
from .blueprints.favorites import favorites_bp

# Basic logging setup
logging.basicConfig(filename='/home/thijmen/.gemini/tmp/2bf9bd0c995e50f4676739552b338adc74f2e03a3f395a078d13ce65bfdec620/backend.log', level=logging.DEBUG)

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Configuration
    app.config["JWT_SECRET_KEY"] = "super-secret-key-change-me"  # Change this in production
    
    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(recipes_bp, url_prefix='/api/recepten')
    app.register_blueprint(favorites_bp, url_prefix='/api/favorieten')

    @app.route('/')
    def index():
        logging.info("Root endpoint was hit")
        return "Welcome to the Sizzle API!"

    @app.errorhandler(404)
    def not_found(error):
        logging.warning(f"404 error at path: {request.path}")
        return jsonify({"error": "Not Found"}), 404
        
    return app

if __name__ == '__main__':
    app = create_app()
    try:
        app.run(debug=True)
    except Exception as e:
        logging.exception("Failed to start the Flask application")
        raise e
