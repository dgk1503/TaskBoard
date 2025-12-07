import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import notesRoutes from "./routes/notes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "../middleware/rateLimiter.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
// this middleware will parse JSON bodies: req.body
// Rate limiter can be disabled for debugging by setting DISABLE_RATE_LIMITER=true
if (process.env.DISABLE_RATE_LIMITER === "true") {
  console.log("Rate limiter disabled via DISABLE_RATE_LIMITER=true");
} else {
  console.log("Rate limiter enabled");
  app.use(rateLimiter);
}

// our simple custom middleware
// app.use((req, res, next) => {
//   console.log(`Req method is ${req.method} & Req URL is ${req.url}`);
//   next();
// });

app.use("/api/notes", notesRoutes);
app.use("/api/auth", authRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});
