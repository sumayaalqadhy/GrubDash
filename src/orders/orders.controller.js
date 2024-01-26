const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign IDs when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// Handler for listing all orders
function list(req, res) {
  res.json({ data: orders });
}

// Middleware for checking if an order exists
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({ status: 404, message: `Order does not exist: ${orderId}` });
}

// Middleware for validating order fields
function validOrderFields(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  if (!deliverTo)
    return next({ status: 400, message: "Order must include a deliverTo" });
  if (!mobileNumber)
    return next({ status: 400, message: "Order must include a mobileNumber" });
  if (!dishes)
    return next({ status: 400, message: "Order must include a dish" });
  if (!Array.isArray(dishes) || dishes.length === 0)
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });

  dishes.forEach((dish, index) => {
    if (
      !dish.quantity ||
      typeof dish.quantity !== "number" ||
      dish.quantity <= 0
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });

  next();
}

// Handler for creating a new order
function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = { id: nextId(), deliverTo, mobileNumber, status, dishes };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// Handler for reading a single order
function read(req, res) {
  res.json({ data: res.locals.order });
}

// Handler for updating an existing order
function update(req, res, next) {
  const order = res.locals.order;
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  if (id && id !== order.id) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${order.id}`,
    });
  }

  if (
    !status ||
    typeof status !== "string" ||
    !["pending", "preparing", "out-for-delivery", "delivered"].includes(status)
  ) {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }

  Object.assign(order, { deliverTo, mobileNumber, status, dishes });

  res.json({ data: order });
}

// Handler for deleting an order
function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (index === -1) {
    return next({ status: 404, message: `Order does not exist: ${orderId}` });
  }
  if (orders[index].status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }

  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [validOrderFields, create],
  read: [orderExists, read],
  update: [orderExists, validOrderFields, update],
  delete: [orderExists, destroy],
};
