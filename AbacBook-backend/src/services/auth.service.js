import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../modules/user.model.js";
import { env } from "../config/env.js";
import { AppError } from "../shared/errors/AppError.js";


export const registerUser = async (data) => {
const exists = await User.findOne({ email: data.email });
if (exists) throw new AppError("Email already exists", 400);


const hashedPassword = await bcrypt.hash(data.password, 10);


const user = await User.create({
...data,
password: hashedPassword,
});


return user;
};


export const loginUser = async (email, password) => {
const user = await User.findOne({ email });
if (!user) throw new AppError("Invalid credentials", 401);


const match = await bcrypt.compare(password, user.password);
if (!match) throw new AppError("Invalid credentials", 401);


const token = jwt.sign({ id: user._id }, env.jwtSecret, { expiresIn: "1d" });


return { user, token };
};