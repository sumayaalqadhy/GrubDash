const express = require("express");
// Initialize the router from express
const ordersRouter = express.Router();

// Importing the controller for orders
const ordersController = require("./orders.controller");

// Importing the middleware for handling methods not allowed
const handleMethodNotAllowed = require("../errors/methodNotAllowed");

// Route handling for specific order operations (GET, PUT, DELETE) on a particular orderId
ordersRouter
  .route("/:orderId")
  .get(ordersController.read) // Handles GET request for a specific order
  .put(ordersController.update) // Handles PUT request to update a specific order
  .delete(ordersController.delete) // Handles DELETE request to remove a specific order
  .all(handleMethodNotAllowed); // Restricts other HTTP methods on this route

// Route handling for general order operations (GET, POST) on the base path
ordersRouter
  .route("/")
  .get(ordersController.list) // Handles GET request to list all orders
  .post(ordersController.create) // Handles POST request to create a new order
  .all(handleMethodNotAllowed); // Restricts other HTTP methods on this route

module.exports = ordersRouter;

