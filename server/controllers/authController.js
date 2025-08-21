import prisma from '../config/db.js'; // Make sure this is a PrismaClient instance
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

// =======================
// Register User
// =======================
export const registerUser = asyncHandler(async (req, res) => {
  // Accept both 'name' and 'username' for compatibility
  const name = req.body.name || req.body.username;
  const { email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please include all fields');
  }

  if (typeof password !== 'string') {
    res.status(400);
    throw new Error('Password must be a string');
  }

  // Check if user exists (by email)
  const userExistsByEmail = await prisma.user.findUnique({
    where: { email }
  });

  if (userExistsByEmail) {
    return res.status(400).json({ msg: "User already exists with this Email" });
  }

  // OPTIONAL: Check duplicate username
  // const userExistsByName = await prisma.user.findUnique({ where: { username } });
  // if (userExistsByName) {
  //   return res.status(400).json({ msg: "User already exists with this Username" });
  // }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  });

  // Generate JWT
  const token = generateToken(user.id);

  // Return JSON (frontend will store token in localStorage)
  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    token
  });
});

// =======================
// Login User
// =======================
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = generateToken(user.id);
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token
    });
  } else {
    res.status(401).json({ msg: "Invalid credentials" });
  }
});

// =======================
// Get User Profile
// =======================
export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =======================
// Logout User
// =======================
// For localStorage-based JWT, "logout" is handled on frontend
// Just clear the token from localStorage there.
// This endpoint is optional, but we can provide one for UI consistency
export const logoutUser = asyncHandler(async (req, res) => {
  return res.status(200).json({ message: 'Logged out successfully, clear token in frontend' });
});

export default { registerUser, loginUser, getUserProfile, logoutUser };
