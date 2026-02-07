import Account from "../modules/account.model.js";


export const createAccount = async (req, res, next) => {
try {
const account = await Account.create(req.body);
res.status(201).json(account);
} catch (err) {
next(err);
}
};


export const getAccounts = async (req, res, next) => {
try {
const accounts = await Account.find();
res.json(accounts);
} catch (err) {
next(err);
}
};