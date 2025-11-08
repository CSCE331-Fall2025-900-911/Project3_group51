export const managementLogin = (req, res) => {
  res.send("Management login successful");
};

export const managementLanding = (req, res) => {
  res.send("Welcome to the Management Dashboard");
};

export const getOrderTrends = (req, res) => {
  res.send("Order trends data retrieved");
};

export const getInventory = (req, res) => {
  res.send("Inventory data retrieved");
};

export const updateInventory = (req, res) => {
  const { id } = req.params;
  res.send(`Inventory item ${id} updated`);
};
