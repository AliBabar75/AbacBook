import dotenv from "dotenv";

dotenv.config();

// console.log("ENV CHECK:", {
//   PORT: process.env.PORT,
//   MONGO_URI: process.env.MONGO_URI,
// });

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
};