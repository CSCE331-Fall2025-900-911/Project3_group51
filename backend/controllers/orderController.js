export const createOrder = (req, res) => {
  res.send("Create order");
};

export const getOrderById = (req, res) => {
  const { id } = req.params;
  res.send(`Get order with ID: ${id}`);
};

export const getAllOrders = (req, res) => {
  res.send("Get all orders");
};