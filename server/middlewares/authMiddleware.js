// import jwt from 'jsonwebtoken'
// import asyncHandler from 'express-async-handler'
// import db from '../config/db.js'

// const protect = asyncHandler(async (req, res, next) => {
//     const authHeader = req.headers.authorization;
    
//     if (authHeader && authHeader?.startsWith('Bearer ')) {
//         const token = req.headers.authorization.split(' ')[1];
//     }
//     // else if (req.cookies.jwt) {
//     //     token = req.cookies.jwt;
//     // }
//     // if (!token) {
//     //     console.error('No token found');
//     //     return res.status(401).json({ msg: "Not authorized, no token" })
//     // }

//     try {
//         const Decoded = jwt.verify(token, process.env.JWT_SECRET);
//         // console.log('Decoded Token:', decode);

//         const user = await db.user.findUnique({
//             where: { id: decoded.userId },
//             select: { id: true, email: true, name: true }
//         });

//         if (!user) {
//             console.error('User not found');
//             return res.status(401).json({ 
//                 success: false,
//                 error: 'Not authorized',
//                 details: 'User not found in database'
//             });
//         }
//         req.user = user;
//         next();

//     } catch (err) {
//         console.error('Token verification failed:', err.message); // Debug: Log error
//         return res.status(401).json({ 
//             success: false,
//             error: 'Not authorized',
//             details: 'token invalid or user not found'});
//     }
// });

// export default protect;



import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import db from '../config/db.js'

const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;

const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('Token extracted:', token);
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized',
      details: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);

    try {
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized',
          details: 'User not found'
        });
      }

      req.user = user;
      return next();
    } catch (dbErr) {
      // Prisma connection or other DB error -> 503 (Service Unavailable)
      console.error('Database error while verifying user:', dbErr.message);
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        details: 'Database connectivity issue'
      });
    }
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({
      success: false,
      error: 'Not authorized',
      details: 'Invalid or expired token'
    });
  }
});


export default protect;