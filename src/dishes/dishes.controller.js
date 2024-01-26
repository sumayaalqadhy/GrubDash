const path = require("path");

// Use the existing dishes data
const dishesData = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const generateNextId = require("../utils/nextId");

// Middleware to check if request body contains a name property
function validateName(req, res, next) {
  const { data: dishData = {} } = req.body;
  if (!dishData.name) {
    return next({ status: 400, message: "Dish must include a name." });
  }
  res.locals.dishData = dishData;
  next();
}

// Middleware to check if request body contains a description property
function validateDescription(req, res, next) {
  const { dishData } = res.locals;
  if (!dishData.description) {
    return next({ status: 400, message: "Dish must include a description." });
  }
  next();
}

// Middleware to check if request body contains a valid price property
function validatePrice(req, res, next) {
  const { dishData } = res.locals;
  if (!dishData.price || dishData.price < 0 || typeof dishData.price !== "number") {
    return next({ status: 400, message: "Dish must include a valid price." });
  }
  next();
}

// Middleware to check if request body contains an image URL property
function validateImageUrl(req, res, next) {
  const { dishData } = res.locals;
  if (!dishData["image_url"]) {
    return next({ status: 400, message: "Dish must include an image_url." });
  }
  next();
}

// Middleware to verify if the specified dish exists
function checkDishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishesData.find(dish => dish.id === dishId);
  if (!foundDish) {
    return next({ status: 404, message: `Dish not found: ${dishId}.` });
  }
  res.locals.dish = foundDish;
  next();
}

// Middleware to validate if body ID matches route ID for updates
function validateIdMatch(req, res, next) {
  const { dishData } = res.locals;
  const { dishId } = req.params;
  if (dishData.id && dishData.id !== dishId) {
    return next({ status: 400, message: `Dish id mismatch: id ${dishData.id} vs route id ${dishId}` });
  }
  next();
}

// Handler to update a dish
function updateDish(req, res) {
  const { dish } = res.locals;
  const { dishData } = res.locals;
  Object.keys(dishData).forEach(key => {
    if (dish[key] !== dishData[key]) {
      dish[key] = dishData[key];
    }
  });
  res.json({ data: dish });
}

// Handler to create a new dish
function createDish(req, res) {
  const newDish = { ...res.locals.dishData, id: generateNextId() };
  dishesData.push(newDish);
  res.status(201).json({ data: newDish });
}

// Handler to read a single dish
function readDish(req, res) {
  res.json({ data: res.locals.dish });
}

// Handler to list all dishes
function listDishes(req, res) {
  res.json({ data: dishesData });
}

module.exports = {
  create: [validateName, validateDescription, validatePrice, validateImageUrl, createDish],
  read: [checkDishExists, readDish],
  update: [checkDishExists, validateName, validateDescription, validatePrice, validateImageUrl, validateIdMatch, updateDish],
  list: listDishes,
};
