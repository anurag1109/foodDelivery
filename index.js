const mongoose = require("mongoose");

const express = require("express");
const app = express();
app.use(express.json());

require("dotenv").config();
const { connection } = require("./configs/db");

const cors = require("cors");
app.use(cors());

const router = require("./routes/routes");

app.use("/api", router);

app.listen(process.env.port, async (req, res) => {
  try {
    await connection;
    console.log("connected to db");
  } catch (error) {
    console.log(error);
  }
  console.log(`server running at port ${process.env.port}`);
});
