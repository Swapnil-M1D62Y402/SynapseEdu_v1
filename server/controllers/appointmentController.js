import prisma from "../config/db.js";
import asyncHandler from 'express-async-handler';

// Book appointment
export const createAppointment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { consultantId, date, time } = req.body;

  console.log("Consultant ID received:", consultantId);

  // Validate consultantId
  const consultant = await prisma.user.findFirst({
    where: {
      id: parseInt(consultantId),
      userType: 'CONSULTANT'
    },
    include: {
      consultantProfile: true
    }
  });

  if (!consultant || !consultant.consultantProfile) {
    console.error("Consultant not found for ID:", consultantId);
    res.status(404);
    throw new Error("Consultant not found");
  }

  try {
    const appointment = await prisma.appointment.create({
      data: {
        userId,
        consultantId: consultant.consultantProfile.id,
        date: new Date(date),
        time,
        status: "pending",
      },
      include: {
        consultant: true,
        user: true
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      message: "Failed to create appointment",
      error: error.message,
    });
  }
});

// Get user appointments
export const getUserAppointments = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const appointments = await prisma.appointment.findMany({
    where: { userId },
    include: {
      consultant: {
        include: {
          user: true
        }
      }
    }
  });

  res.json(appointments);
});


export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;
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
    res.status(403);
    throw new Error('Only consultants can update appointment status');
  }

  // Verify appointment exists and belongs to this consultant
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: parseInt(appointmentId),
      consultantId: consultant.consultantProfile.id
    }
  });

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Update appointment status
  const updatedAppointment = await prisma.appointment.update({
    where: {
      id: parseInt(appointmentId)
    },
    data: {
      status
    },
    include: {
      user: {
        select: {
          username: true,
          email: true
        }
      }
    }
  });

  res.json(updatedAppointment);
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
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
    res.status(403);
    throw new Error('Not authorized');
  }

  // Parse id as integer and verify appointment belongs to this consultant
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    res.status(400);
    throw new Error('Invalid appointment ID');
  }

  // Verify appointment belongs to this consultant
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: parsedId,
      consultantId: consultant.consultantProfile.id
    }
  });

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  await prisma.appointment.delete({
    where: { id: parsedId }
  });

  res.json({ message: 'Appointment deleted successfully' });
});