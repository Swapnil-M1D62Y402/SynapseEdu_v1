import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';

export const saveLocation = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { latitude, longitude } = req.body;

  const location = await prisma.location.create({
    data: {
      userId: req.user.id, // From auth middleware
      latitude,
      longitude,
    },
  });

  res.status(201).json(location);
});

export const getLatestLocation = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const location = await prisma.location.findFirst({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json(location || null);
});