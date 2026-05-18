const express = require("express");
const mongoose = require("mongoose");
const restaurants = require("./routes/restaurants");
const eatlists = require("./routes/eatlists");
const users = require("./routes/users")
const { consoleLogger } = require("./middlewares/logger");
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 8800;
mongoose.connect(process.env.DB_ATLAS || process.env.DB_LOCAL).then(() => console.log("MongoDB connected")).catch((error) => console.log(error))

app.use(cors());
app.use(express.json())

// morgan logger
app.use(consoleLogger);

app.use("/api/restaurants", restaurants);
app.use("/api/eatlists", eatlists);
app.use("/api/users", users);

app.listen(port, () => console.log(`server is running on port ${port}`));