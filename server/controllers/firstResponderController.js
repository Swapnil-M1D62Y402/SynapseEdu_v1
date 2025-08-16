// import prisma from "../config/db.js";
// import asyncHandler from "express-async-handler";

// // Fetch all SOS messages for the first responder
// export const getFirstResponderSOS = asyncHandler(async (req, res) => {
//   // Only allow the default first responder
//   if (req.user.email !== "ansunanda122@gmail.com") {
//     return res.status(403).json({ message: "Forbidden" });
//   }

//   // Fetch all SOS messages sent to this responder
//   const sosMessages = await prisma.sOSMessage.findMany({
//     where: {
//       firstResponderEmail: "ansunanda122@gmail.com"
//     },
//     include: {
//       user: true, // youth user info
//       location: true
//     },
//     orderBy: { createdAt: "desc" }
//   });

//   res.json(sosMessages);
// });

import prisma from "../config/db.js";
import asyncHandler from "express-async-handler";

// Fetch all SOS messages for any first responder
export const getFirstResponderSOS = asyncHandler(async (req, res) => {
  // Allow only users with userType FIRST_RESPONDER
  if (req.user.userType !== "FIRST_RESPONDER") {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Fetch all SOS messages (optionally, you can filter further if needed)
  const sosMessages = await prisma.sosMessage.findMany({
    include: {
      firstResponder: true,
      youth: true, // youth user info
      location: true
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(sosMessages);
});

export const resolveSOSMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify user is a first responder
  if (req.user.userType !== 'FIRST_RESPONDER') {
    res.status(403);
    throw new Error('Not authorized');
  }

  await prisma.sosMessage.delete({
    where: { id: parseInt(id) }
  });

  res.json({ message: 'SOS message resolved' });
});