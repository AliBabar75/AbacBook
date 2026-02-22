import Item from "../modules/item.model.js";


export const createItem = async (req, res, next) => {
  try {
    
const payload = { ...req.body };

const name = payload.name?.toLowerCase() || "";
const code = payload.code?.toLowerCase() || "";

if (name.includes("oil") || code.includes("oil")) {
  payload.unit = "ML";
}

const item = await Item.create(payload);

    res.status(201).json(item);
  } catch (err) {

  // Agar Mongoose required field error hai
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Please fill all required fields"
    });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong while creating item"
  });
}
};

export const getItems = async (req, res, next) => {
  try {
   
    const items = await Item.find();

    res.json(items);
  } catch (err) {
    next(err);
  }
};
