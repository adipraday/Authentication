import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/Database.js";
import multer from "multer";
import router from "./routes/index.js";
import Users from "./models/UserModel.js";
import Customers from "./models/CustomerModel.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

try {
  await db.authenticate();
  console.log("Database Connected...");
  await Users.sync();
  await Customers.sync();
} catch (error) {
  console.error("Database connection error:", error);
}

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:9001",
  "http://103.159.112.249:9001",
];

const corsOptions = {
  origin: allowedOrigins,
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.json());
app.use(router);

// Define a route for the root path
app.get("/", (req, res) => {
  res.send("API Services");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
