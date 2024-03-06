import Users from "../models/UserModel.js";
import Customers from "../models/CustomerModel.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
const apiWaUrl =
  "https://api.360messenger.net/sendMessage/VRu61o7KraCQeaKC3UB7Azi45OAxcQJh4UE";

export const Register = async (req, res) => {
  const {
    username,
    name,
    role,
    level,
    aktifSejak,
    whatsapp,
    telp,
    email,
    password,
    confPassword,
  } = req.body;
  if (password !== confPassword) {
    return res.json({ msg: "Password dan Confirm Password tidak cocok" });
  }
  //   if (!req.file) {
  //     return res.json({ msg: "Image harus di upload" });
  //   }
  //   const image = req.file.path;

  try {
    const hashPassword = await argon2.hash(password);
    await Users.create({
      username: username,
      name: name,
      role: role,
      level: level,
      aktifSejak: aktifSejak,
      whatsapp: whatsapp,
      telp: telp,
      email: email,
      profile_picture: null,
      status: "Available",
      password: hashPassword,
    });
    res.status(200).json({ msg: "Register Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const Login = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: {
        email: req.body.email,
      },
    });
    const userId = user.id;
    const name = user.name;
    const email = user.email;
    try {
      await argon2.verify(user.password, req.body.password);
      // Generate tokens
      const accessToken = jwt.sign(
        { userId, name, email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "20s",
        }
      );
      const refreshToken = jwt.sign(
        { userId, name, email },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      );
      await Users.update(
        { refresh_token: refreshToken },
        {
          where: {
            id: userId,
          },
        }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({ accessToken });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: "Wrong Password" });
    }

    // res.status(200).json(user.email);
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ msg: `Email tidak ditemukan ${req.body.email}` });
  }
};

export const updatePassword = async (req, res) => {
  const { id, password, confPassword } = req.body;

  try {
    await Users.findOne({ where: { id: id } });
    try {
      if (password !== confPassword) {
        return res.json({ msg: "Password dan Confirm Password tidak cocok" });
      }
      const hashPassword = await argon2.hash(password);
      await Users.update(
        {
          password: hashPassword,
        },
        {
          where: {
            id: id,
          },
        }
      );
      res.status(200).json({ msg: `Password updated` });
    } catch (error) {
      error.status(500).json({ msg: `update failed` });
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ msg: `User not found` });
  }
};

export const CustomerRegister = async (req, res) => {
  const { name, whatsappNumber, telp, email, password, confPassword } =
    req.body;
  if (password !== confPassword) {
    return res.json({ msg: "Password dan Confirm Password tidak cocok" });
  }
  try {
    const hashPassword = await argon2.hash(password);
    await Customers.create({
      name: name,
      whatsapp: whatsappNumber,
      telp: telp,
      email: email,
      profile_picture: null,
      status: "Active",
      password: hashPassword,
    });
    res.status(200).json({ msg: "Registrasi Sukses" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const ReqOtp = async (req, res) => {
  try {
    function generateOTP() {
      return String(Math.floor(100000 + Math.random() * 900000)).padStart(
        6,
        "0"
      );
    }
    const otp = generateOTP();
    // Check if the customer exists
    const cek_customer = await Customers.findOne({
      where: { whatsapp: req.body.whatsappNumber },
    });
    if (!cek_customer) {
      return res.status(404).json({ msg: "Nomor anda belum terdaftar" });
    } else {
      const hashOtp = await argon2.hash(otp);
      await Customers.update(
        { otp: hashOtp },
        { where: { whatsapp: req.body.whatsappNumber } }
      );
      // Send OTP to WhatsApp ///////////////////////////////////////////////////
      const text = `Berikut kode OTP anda : ${otp}, akan expired dalam 5 menit.\n\nJaga kerahasiaan kode OTP anda.`;
      const formData = new FormData();
      formData.append("phonenumber", req.body.whatsappNumber);
      formData.append("text", text);
      await fetch(apiWaUrl, {
        method: "POST",
        body: formData,
      });
    }
    res
      .status(200)
      .json({ msg: "Kode OTP sudah dikirimkan ke nomor whatsapp anda" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const LoginOtp = async (req, res) => {
  const { whatsappNumber, otpCode } = req.body;
  try {
    const user = await Customers.findOne({
      where: {
        whatsapp: whatsappNumber,
      },
    });
    const userId = user.id;
    const name = user.name;
    const whatsapp = user.whatsapp;
    const telp = user.telp;
    const email = user.email;
    const profile_picture = user.profile_picture;
    if (!user) {
      return res.status(404).json({ msg: "Pengguna tidak ditemukan" });
    }
    const last_request = user.updatedAt;
    const currentTime = new Date().getTime();
    const checkOtp = currentTime - last_request;
    const timeDifferenceInMinutes = checkOtp / (1000 * 60);
    if (timeDifferenceInMinutes > 5) {
      return res.status(404).json({ msg: "Request has expired" });
    }
    await argon2.verify(user.otp, otpCode);
    // Generate tokens
    const accessToken = jwt.sign(
      { userId, name, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "20s",
      }
    );
    const refreshToken = jwt.sign(
      { userId, name, whatsapp, telp, email, profile_picture },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    await Users.update(
      { refresh_token: refreshToken },
      {
        where: {
          id: userId,
        },
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "Otp code cannot accepted" });
  }
};

export const LoginCustomer = async (req, res) => {
  try {
    const user = await Customers.findOne({
      where: {
        email: req.body.email,
      },
    });
    const userId = user.id;
    const name = user.name;
    const email = user.email;
    try {
      await argon2.verify(user.password, req.body.password);
      // Generate tokens
      const accessToken = jwt.sign(
        { userId, name, email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "20s",
        }
      );
      const refreshToken = jwt.sign(
        { userId, name, email },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      );
      await Customers.update(
        { refresh_token: refreshToken },
        {
          where: {
            id: userId,
          },
        }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({ accessToken });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: "Wrong Password" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ msg: `Email tidak ditemukan ${req.body.email}` });
  }
};
