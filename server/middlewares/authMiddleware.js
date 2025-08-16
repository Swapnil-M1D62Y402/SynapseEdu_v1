import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import db from '../config/db.js'

const protect = asyncHandler(async (req, res, next) => {

    // Log headers and cookies for debugging
    // console.log('Headers:', req.headers);
    // console.log('Cookies:', req.cookies);

    // let token = req.cookies.jwt || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    //----CHANGES START
    let token;
    
    // Check for token in cookies first, then authorization header
    // First try authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Then fallback to cookies
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    //----CHANGES END

    if (!token) {
        console.error('No token found');
        return res.status(401).json({ msg: "Not authorized, no token" })
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('Decoded Token:', decode);

        const user = await db.user.findUnique({
            where: { id: decode.userId },
            select: { id: true, email: true, username: true, userType: true }
        });

        if (!user) {
            console.error('User not found');
            return res.status(401).json({ 
                error: 'Not authorized',
                details: 'User not found in database'
            });
        }
        req.user = user;
        next();

    } catch (err) {
        console.error('Token verification failed:', err.message); // Debug: Log error
        return res.status(401).json({ msg: "Not authorized, token invalid" });
    }
});

export default protect;