import Item from "../modules/item.model.js";


export const createItem = async (req, res, next) => {
  try {
    console.log("AUTH USER:", req.user);

    // const item = await Item.create({
    //   ...req.body 
    // });

const payload = { ...req.body };

const name = payload.name?.toLowerCase() || "";
const code = payload.code?.toLowerCase() || "";

if (name.includes("oil") || code.includes("oil")) {
  payload.unit = "ML";
}

const item = await Item.create(payload);

    res.status(201).json(item);
  } catch (err) {
  
      console.log("CREATE ITEM ERROR >>>", err);
  return res.status(400).json({
    success: false,
    message: err.message,
    details: err.errors || null,
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
