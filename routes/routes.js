const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Restaurant, Order } = require("../models/models");

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      address,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, "secret-key");

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Reset user password
router.put("/user/:id/reset", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current password is correct
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new restaurant
router.post("/restaurants", async (req, res) => {
  try {
    const { name, address, menu } = req.body;

    // Create a new restaurant
    const restaurant = new Restaurant({
      name,
      address,
      menu,
    });

    await restaurant.save();

    res.status(201).json({ message: "Restaurant added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all restaurants
router.get("/restaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a specific restaurant
router.get("/restaurants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get the menu of a specific restaurant
router.get("/restaurants/:id/menu", async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(200).json(restaurant.menu);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new item to a specific restaurant's menu
router.post("/restaurants/:id/menu", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image } = req.body;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const newItem = {
      name,
      description,
      price,
      image,
    };

    restaurant.menu.push(newItem);
    await restaurant.save();

    res.status(201).json({ message: "Item added to the menu successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a menu item from a specific restaurant
router.delete("/restaurants/:restaurantId/menu/:itemId", async (req, res) => {
  try {
    const { restaurantId, itemId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const itemIndex = restaurant.menu.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    restaurant.menu.splice(itemIndex, 1);
    await restaurant.save();

    res.status(202).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Place an order
router.post("/orders", async (req, res) => {
  try {
    const { user, restaurant, items, totalPrice, deliveryAddress } = req.body;

    // Create a new order
    const order = new Order({
      user,
      restaurant,
      items,
      totalPrice,
      deliveryAddress,
      status: "placed",
    });

    await order.save();

    res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get the details of a specific order
router.get("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("restaurant");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update the status of a specific order
router.put("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
