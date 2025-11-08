export const startOrder = (req, res) => {
  res.send("Start new order!");
};

export const createOrder = (req, res) => {
  res.send("Create order");
};

// TODO: Only for admin
export const getOrderById = (req, res) => {
  const { id } = req.params;
  res.send(`Get order with ID: ${id}`);
};

// TODO: Only for admin
export const getAllOrders = (req, res) => {
  res.send("Get all orders");
};