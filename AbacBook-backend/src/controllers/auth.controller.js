import { registerUser, loginUser } from "../services/auth.service.js";


export const register = async (req, res, next) => {
try {
const user = await registerUser(req.body);
res.status(201).json({ success: true, user });
} catch (err) {
next(err);
}
};


export const login = async (req, res, next) => {
try {
const result = await loginUser(req.body.email, req.body.password);
res.json({ success: true, ...result });
} catch (err) {
next(err);
}
};