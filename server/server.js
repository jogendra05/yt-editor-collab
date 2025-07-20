import express from "express";
import "dotenv/config"
import mainRouter from "./src/route/index.js"
import open from "open";
import cors from 'cors';
import creatorRedirect from "./src/googleAuth.js";
import connectDB from "./src/config/mongoDB.js";
import connectCloudinary from "./src/config/cloudinary.js";
import cookieParser from "cookie-parser";

const app = express();

// Middlewares
app.use(cors())
app.use(express.json());
app.use(cookieParser());

// DB connection
connectDB();
connectCloudinary();

// Routes
app.use("/api", mainRouter) 
app.use("/", creatorRedirect)
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Api is Working");
});

app.listen(port, () => console.log("Server Started at ",port))