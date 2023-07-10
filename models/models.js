const mongoose = require("mongoose");

// User Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip: String,
  },
});

const User = mongoose.model("User", userSchema);

// Restaurant Model
const restaurantSchema = new mongoose.Schema({
  name: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip: String,
  },
  menu: [
    {
      name: String,
      description: String,
      price: Number,
      image: String,
    },
  ],
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

// Order Model
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalPrice: Number,
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip: String,
  },
  status: String,
});

const Order = mongoose.model("Order", orderSchema);

module.exports = {
  User,
  Restaurant,
  Order,
};
