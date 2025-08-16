import prisma from "../config/db.js";
import asyncHandler from 'express-async-handler';

export const updateTrustedEmail = asyncHandler(async (req, res) => {
    const { trustedEmail } = req.body;
  
    if (!trustedEmail) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
  
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { trustedEmail },
      select: {
        id: true,
        username: true,
        email: true,
        trustedEmail: true
      }
    });
  
    res.json(updatedUser);
});

export const getTrustedEmail = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {trustedEmail: true }
  });

  if(!user){
    return res.status(404).json({message: 'User not found'})
  }

  // Return empty string if no trusted email is set
  res.json({trustedEmail: user.trustedEmail || ''});
})