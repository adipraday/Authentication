import express from "express";
import {
  Register,
  Login,
  CustomerRegister,
  ReqOtp,
  LoginOtp,
  LoginCustomer,
} from "../controllers/Authentication.js";
import {
  getUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
} from "../controllers/Users.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";

const router = express.Router();

// Users Authentication ////////////////////////////////////////////////////
router.post("/register", Register);
router.post("/login", Login);
// Customers Authentication ////////////////////////////////////////////////
router.post("/custregister", CustomerRegister);
router.post("/reqotp", ReqOtp);
router.post("/otplogin", LoginOtp);
router.post("/customerlogin", LoginCustomer);
// Users Data //////////////////////////////////////////////////////////////
router.get("/users", verifyToken, getUsers);
router.get("/user/:id", verifyToken, getUserById);
router.post("/getuserbyemail", verifyToken, getUserByEmail);
router.patch("/updateuser", verifyToken, updateUser);
router.delete("/deleteuser/:id", verifyToken, deleteUser);
// Middleware //////////////////////////////////////////////////////////////
router.get("/refreshtoken", verifyToken, refreshToken);

export default router;
