# API Configuration Guide

## How to Change API Endpoints

All API endpoints are centralized in **`config.js`**. To change the backend URL:

1. Open [`config.js`](config.js)
2. Update the `API_BASE_URL` constant:

```javascript
const API_BASE_URL = 'http://127.0.0.1:5000';  // Change this line
```

### Examples:

**Local development:**
```javascript
const API_BASE_URL = 'http://127.0.0.1:5000';
```

**Production server:**
```javascript
const API_BASE_URL = 'https://api.sizzle.com';
```

**Different port:**
```javascript
const API_BASE_URL = 'http://localhost:8080';
```

## Available Endpoints

All endpoints are automatically generated from `API_BASE_URL`:

- `API.REGISTER` - User registration
- `API.LOGIN` - User login
- `API.ME` - Get/update/delete user profile
- `API.RECIPES` - List all recipes
- `API.RECIPE_DETAIL(id)` - Get specific recipe details
- `API.RECIPE_ASK(id)` - Ask AI about a recipe
- `API.RECOMMENDATIONS` - Get personalized recommendations
- `API.FAVORITES` - Get all favorites
- `API.FAVORITE_TOGGLE(id)` - Add/remove favorite

## Usage in Code

All JavaScript files use `window.API`:

```javascript
// Example: Fetch recipes
fetch(window.API.RECIPES)

// Example: Get recipe details
fetch(window.API.RECIPE_DETAIL('123'))

// Example: Toggle favorite
fetch(window.API.FAVORITE_TOGGLE(recipeId), { method: 'POST' })
```

**That's it!** Change one line in `config.js` and the entire app updates.
