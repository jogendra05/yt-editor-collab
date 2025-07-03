import express from "express";
import "dotenv/config"

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Api is Working");
});

app.listen(port, () => console.log("Server Started at ",port))