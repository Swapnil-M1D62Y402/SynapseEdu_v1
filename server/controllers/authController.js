import prisma from '../config/db.js'
import asyncHandler from 'express-async-handler'
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

// Register user
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, userType } = req.body;

  // Validation
  if (!username || !email || !password || !userType) {
    res.status(400);
    throw new Error('Please include all fields');
  }

  if (typeof password !== 'string') { 
    res.status(400);
    throw new Error('Password must be a string');
  }

  // Check if user exists
  const userExistsByEmail = await prisma.user.findUnique({ where: { email: email} });
  if (userExistsByEmail) {
    res.status(400).json({msg: "User already exists with same Email"});
    console.log("User already exists with same Email");
    return;
  }

  // const userExistsByName = await prisma.user.findUnique({ where: { username: username } });
  // if (userExistsByName) {
  //   res.status(400).json({msg: "User already exists with same Email"});
  //   console.log("User already exists with same Name");
  //   return;
  // }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      userType: userType
    }
  });

  // Generate token and respond
  const token = generateToken(res, user.id);

  res.status(201).json({
    id: user.id,
    username: user.username,
    email: user.email,
    userType: user.userType,
    token
  });
});

// Login user (placeholder logic for now)
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } }) //find user by email
  
  if (user && (await bcrypt.compare(password, user.password))) { 
    const token = generateToken(res, user.id);
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      token //Include token in response to be stored as local storage
    });
  } else { 
    res.status(401).json({msg: "Invalid Credentials"});
    throw new Error("Invalid Credentials");
  }
});

// authController.js
export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {id:true, username: true, email:true, userType:true, createdAt: true}
    });
    res.status(200).json(user); // Explicit JSON
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" }); // Never send HTML
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  })
  res.status(200).json({ message: 'Logged out successfully' });
});


export default { registerUser, loginUser, getUserProfile, loginUser };

