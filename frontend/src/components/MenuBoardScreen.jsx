import React, { useEffect, useState } from "react";
import { getMenu } from "../api/menu.js";
import "./MenuBoardScreen.css";

export default function MenuBoardScreen() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenu()
      .then(data => {
        setMenu(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="menu-board-loading">Loading...</div>;

  // Group drinks by category
  const grouped = menu.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  return (
    <div className="menu-board-wrapper">
      <div className="menu-board-container">
        {Object.entries(grouped).map(([category, items]) => {

          const baseUrl =
            (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(
              "/api",
              ""
            );

          // Use FIRST drink image in this category
          const categoryImage = items[0]?.image
            ? `${baseUrl}/images/Icons/${items[0].image}`
            : null;

          return (
            <div key={category} className="menu-board-section">

              <div className="menu-board-header">
                {categoryImage && (
                  <img
                    src={categoryImage}
                    alt={category}
                    className="menu-board-category-image"
                  />
                )}
                <h2 className="menu-board-category">{category}</h2>
              </div>

              <ul className="menu-board-list">
                {items.map(drink => (
                  <li key={drink.drinkid} className="menu-board-item">
                    <span>{drink.drinkname}</span>
                    <span className="menu-board-price">${drink.price}</span>
                  </li>
                ))}
              </ul>

            </div>
          );
        })}
      </div>

      {/* ================================================== */}
      {/* STATIC CUSTOMIZATION SECTION */}
      {/* ================================================== */}

      <div className="menu-board-customization">
        <h2 className="menu-board-custom-title">CUSTOMIZATION OPTIONS</h2>

        <div className="menu-board-custom-grid">

          <div>
            <h3>Ice Level</h3>
            <ul>
              <li>Regular Ice</li>
              <li>Light Ice</li>
              <li>No Ice</li>
              <li>Extra Ice</li>
            </ul>
          </div>

          <div>
            <h3>Sweetness Level</h3>
            <ul>
              <li>100% Sugar</li>
              <li>80% Sugar</li>
              <li>50% Sugar</li>
              <li>30% Sugar</li>
              <li>No Sugar</li>
            </ul>
          </div>

          <div>
            <h3>Toppings (+Extra Cost)</h3>
            <ul>
              <li>Pearl (Boba) — $0.75</li>
              <li>Coffee Jelly — $0.75</li>
              <li>Pudding — $0.75</li>
              <li>Lychee Jelly — $0.75</li>
              <li>Honey Jelly — $0.75</li>
              <li>Crystal Boba — $0.75</li>
              <li>Mango Popping Boba — $1.00</li>
              <li>Strawberry Popping Boba — $1.00</li>
              <li>Ice Cream — $1.00</li>
              <li>Creama — $1.25</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
