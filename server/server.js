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

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.REDIRECT_URI
// );

// // Scopes required for uploading videos
// const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];

// // STEP 1: Redirect user to authorize
// app.get("/auth", async (req, res) => {
//   const url = oauth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: SCOPES,
//     prompt: "consent",
//   });

//   res.redirect(url);
// });

// // STEP 2: Handle OAuth2 callback and store tokens
// app.get("/oauth2callback", async (req, res) => {
//   const { code } = req.query;
//   const { tokens } = await oauth2Client.getToken(code);
//   oauth2Client.setCredentials(tokens);

//   // Save tokens for later (in DB or file)
//   fs.writeFileSync("tokens.json", JSON.stringify(tokens));

//   res.send("Authentication successful! You can close this window.");
// });

// // STEP 3: Upload a video using saved credentials
// app.get("/upload", async (req, res) => {
//   try {
//     const tokens = JSON.parse(fs.readFileSync("tokens.json"));
//     oauth2Client.setCredentials(tokens);

//     const youtube = google.youtube({ version: "v3", auth: oauth2Client });

//     const response = await youtube.videos.insert({
//       part: ["snippet", "status"],
//       requestBody: {
//         snippet: {
//           title: "Test Video",
//           description: "Uploaded via API",
//         },
//         status: {
//           privacyStatus: "public",
//         },
//       },
//       media: {
//         body: fs.createReadStream("./try.mp4"),
//       },
//     });

//     res.send("Video uploaded: " + response.data.id);
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).send("Upload failed");
//   }
// });

app.get("/", (req, res) => {
  res.send("Api is Working");
});

app.listen(port, () => console.log("Server Started at ",port))