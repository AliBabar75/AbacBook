  import Expense from "../modules/expense.model.js";
  import Account from "../modules/account.model.js";
  import Ledger from "../modules/ledger.model.js";

  export const createExpense = async (data) => {

    const {
      date,
      category,
      description,
      amount,
      paidTo,
      paymentMethod,
      reference
    } = data;

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // 🔹 Find Expense Account (Debit)
    const expenseAccount = await Account.findOne({
      name: category,
      type: "EXPENSE"
    });

    if (!expenseAccount) {
      throw new Error("Expense category account not found");
    }

    // 🔹 Find Payment Account (Credit)
    const paymentAccount = await Account.findOne({
      name: paymentMethod,
      type: "ASSET"
    });

    if (!paymentAccount) {
      throw new Error("Payment account not found");
    }

    // 🔹 Create Expense Document
    const expense = await Expense.create({
      date,
      category,
      description,
      amount,
      paidTo,
      paymentMethod,
      reference
    });

    // 🔹 Ledger Entry
    await Ledger.create({
      description: `Expense - ${description}`,
      debitAccount: expenseAccount._id,
      creditAccount: paymentAccount._id,
      amount,
      date
    });

    return expense;
  };


  export const getExpenses = async () => {
    const expenses = await Expense.find()
      .sort({ createdAt: -1 })
      .lean();

    return expenses.map((e) => ({
      // id: e._id,
      date: e.date ? new Date(e.date).toLocaleDateString("en-GB")
        : "—",
      category: e.category,
      description: e.description,
      amount: e.amount,
      paidTo: e.paidTo,
      paymentMethod: e.paymentMethod,
      reference: e.reference,
    }));
  };