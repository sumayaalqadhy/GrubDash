const express = require("express");
// Create a new router instance for dishes
const router = express.Router();

// Importing the controller functions for dish operations
const dishesController = require("./dishes.controller");

// Importing the middleware to handle unsupported methods
const handleMethodNotAllowed = require("../errors/methodNotAllowed");

// Route for specific dish operations (GET, PUT) using :dishId
// GET for reading a single dish, PUT for updating a dish
router
  .route("/:dishId")
  .get(dishesController.read)  // Handles GET requests to /:dishId
  .put(dishesController.update) // Handles PUT requests to /:dishId
  .all(handleMethodNotAllowed); // Handles all other methods not allowed for /:dishId

// Route for general dish operations (GET, POST)
// GET for listing all dishes, POST for creating a new dish
router
  .route("/")
  .get(dishesController.list)   // Handles GET requests to /
  .post(dishesController.create) // Handles POST requests to /
  .all(handleMethodNotAllowed); // Handles all other methods not allowed for /

// Export the router to be used in other parts of the application
module.exports = router;


