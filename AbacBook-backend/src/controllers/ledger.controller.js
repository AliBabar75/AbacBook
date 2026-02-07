import Ledger from "../modules/ledger.model.js";


export const createEntry = async (req, res, next) => {
try {
const { debitAccount, creditAccount, amount } = req.body;


if (amount <= 0) throw new Error("Invalid amount");


const entry = await Ledger.create({
...req.body,
});


res.status(201).json(entry);
} catch (err) {
next(err);
}
};