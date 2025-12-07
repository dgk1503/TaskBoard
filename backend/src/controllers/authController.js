import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../../models/User.js";
import { sendVerificationEmail } from "../config/nodeMailer.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    console.log(`[auth] register request for: ${email}`);
    console.time(`[auth] register ${email}`);
    const existing_user = await userModel.findOne({ email });

    if (existing_user) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashed_pass = await bcrypt.hash(password, 12);

    const user = new userModel({
      name,
      email,
      password: hashed_pass,
      // OTP fields intentionally omitted while testing
      isAccountVerified: true,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 604800000,
    });
    console.timeEnd(`[auth] register ${email}`);
    return res.json({
      success: true,
      message: "Check your email for verification code.",
    });
  } catch (err) {
    console.error(`[auth] register error for ${email}:`, err.message || err);
    res.json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    console.log(`[auth] login request for: ${email}`);
    console.time(`[auth] login ${email}`);
    const user = await userModel.findOne({ email });

    if (!user) {
      console.timeEnd(`[auth] login ${email}`);
      return res.json({ success: false, message: "No user found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.timeEnd(`[auth] login ${email}`);
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 604800000,
    });
    console.timeEnd(`[auth] login ${email}`);

    return res.json({ success: true });
  } catch (err) {
    console.error(`[auth] login error for ${email}:`, err.message || err);
    res.json({ success: false, message: "Log in error " });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({ success: true, message: "Logged out" });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    if (String(user.verifyOtp) !== String(otp)) {
      return res.json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    if (
      !user.verifyOtpExpireAt ||
      Date.now() > Number(user.verifyOtpExpireAt)
    ) {
      return res.json({
        success: false,
        message: "Verification code expired.",
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 604800000,
    });

    return res.json({ success: true, message: "Email verification complete." });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.user)
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });

    const { password, verifyOtp, verifyOtpExpireAt, ...safeUser } = req.user
      .toObject
      ? req.user.toObject()
      : req.user;
    return res.json({ success: true, user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
