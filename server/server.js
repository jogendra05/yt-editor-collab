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

app.use(cors({
  origin: ['http://localhost:5173'], // Add Vite port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

// DB connection
connectDB();
connectCloudinary();

app.use("/api", mainRouter) 
app.use("/", creatorRedirect)
const port = process.env.PORT;

app.use(express.json());


app.get("/", (req, res) => {
  res.send("Api is Working");
});

app.listen(port, () => console.log("Server Started at ",port))