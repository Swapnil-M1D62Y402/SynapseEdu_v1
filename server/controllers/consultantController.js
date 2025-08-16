import prisma from "../config/db.js";
import asyncHandler from 'express-async-handler';

// Get all consultants
export const getAllConsultants = asyncHandler(async (req, res) => {
    try {
      const consultants = await prisma.user.findMany({
        where: { 
          userType: 'CONSULTANT',
        },
        include: {
          consultantProfile: true
        }
      });
  
      // Format the response to match the Doctor interface
      const formattedConsultants = consultants.map(consultant => ({
        id: consultant.id,
        name: consultant.username, // Using username as name
        specialty: consultant.consultantProfile?.specialty || 'General Consultant',
        experience: consultant.consultantProfile?.experience || 0,
        available: consultant.consultantProfile?.available || false,
        createdAt: consultant.createdAt,
        updatedAt: consultant.updatedAt
      }));
  
      res.json(formattedConsultants);
    } catch (error) {
      console.error('Error fetching consultants:', error);
      res.status(500).json({ 
        message: 'Failed to fetch consultants',
        error: error.message 
      });
    }
});

// Get consultant by ID
export const getConsultantById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const consultant = await prisma.consultantProfile.findUnique({
    where: { id: parseInt(id) },
    include: {
        consultantProfile: true
    }
  });

  if (!consultant || consultant.userType !== 'CONSULTANT') {
    res.status(404);
    throw new Error('Consultant not found');
  }

  res.json(consultant);
});

// Update consultant profile
export const updateConsultantProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { specialty, experience, available } = req.body;
  
    // First, verify the user is a consultant
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { consultantProfile: true }
    });
  
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
  
    if (user.userType !== 'CONSULTANT') {
      res.status(403);
      throw new Error('Only consultants can update profiles');
    }
  
    // Create or update profile
    const profile = await prisma.consultantProfile.upsert({
      where: {
        userId: userId
      },
      update: {
        specialty,
        experience,
        available
      },
      create: {
        userId: userId,
        specialty,
        experience: experience || 0,
        available: available ?? true
      }
    });
  
    res.json({
      message: 'Profile updated successfully',
      profile
    });
});

export const getConsultantProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Verify user is a consultant
  const user = await prisma.user.findUnique({
    where: { 
      id: userId,
      userType: 'CONSULTANT'
    },
    include: {
      consultantProfile: true
    }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.consultantProfile) {
    res.status(404);
    throw new Error('Consultant profile not found');
  }

  res.json(user.consultantProfile);
});

// Get consultant appointments
export const getConsultantAppointments = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Verify user is a consultant
  const consultant = await prisma.user.findUnique({
    where: { 
      id: userId,
      userType: 'CONSULTANT'
    },
    include: {
      consultantProfile: true
    }
  });

  if (!consultant?.consultantProfile) {
    res.status(404);
    throw new Error('Consultant profile not found');
  }

  // Get appointments for this consultant
  const appointments = await prisma.appointment.findMany({
    where: {
      consultantId: consultant.consultantProfile.id
    },
    include: {
      user: {
        select: {
          username: true,
          email: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });

  res.json(appointments);
});
