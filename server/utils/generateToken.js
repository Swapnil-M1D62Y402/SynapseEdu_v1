import jwt from 'jsonwebtoken';

// const generateToken = (res, userId) => {
//   const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
//     expiresIn: '1d'
//   });

//   const isProduction = process.env.NODE_ENV === 'production';

//   // Production Settings 
//   res.cookie('jwt', token, {
//     httpOnly: true,
//     secure: true, // Always use secure in production
//     sameSite: 'None', // Required for cross-site cookies
//     maxAge: 24 * 60 * 60 * 1000, // 1 day
//     path: '/',
//     domain: isProduction ? '.onrender.com' : 'localhost' // Update with your domain
//   });

//   //Local Development settings
//   // res.cookie('jwt', token, {
//   //   httpOnly: true,
//   //   secure: process.env.NODE_ENV === 'production',
//   //   sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
//   //   maxAge: 24 * 60 * 60 * 1000, // 1 day
//   // });

//   return token;
// };

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

export default generateToken;
