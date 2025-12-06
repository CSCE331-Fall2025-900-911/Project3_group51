import React, { useEffect, useState } from "react";
import { getMenu } from "../api/menu.js";
import "./MenuBoardScreen.css";

export default function MenuBoardScreen() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // same image base logic as OrderScreen (this is the version that worked before)
  const imageBase = (import.meta.env.VITE_API_URL || "http://localhost:3000/api")
    .replace(/\/api$/, "");

  useEffect(() => {
    getMenu()
      .then((data) => {
        setMenu(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="menu-board-loading">Loading...</div>;

  // Group drinks by category
  const grouped = menu.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  return (
    <div className="menu-board-container">
      {/* MAIN GRID */}
      <div className="menu-board-grid">
        {Object.entries(grouped).map(([category, items]) => {
          // Use the FIRST drink image in this category as the icon
          const categoryImage = items[0]?.image
            ? `${imageBase}/images/${items[0].image}`
            : null;

          return (
            <div key={category} className="menu-board-section">
              {/* Header with small icon + title */}
              <div className="menu-board-category-header">
                {categoryImage && (
                  <img
                    src={categoryImage}
                    alt={category}
                    className="menu-board-category-image"
                  />
                )}
                <h2 className="menu-board-category">{category}</h2>
              </div>

              {/* Items with dotted leader line */}
              <ul className="menu-board-list">
                {items.map((drink) => (
                  <li key={drink.drinkid} className="menu-board-item">
                    <span className="menu-board-item-name">
                      {drink.drinkname}
                    </span>
                    <span className="menu-board-item-dots" />
                    <span className="menu-board-price">
                      ${parseFloat(drink.price).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* CUSTOMIZATION STRIP (horizontal, aligned like the Sharetea board) */}
      <div className="menu-board-customization-bar">
        <div className="menu-board-customization-row">
          <span className="custom-label">ICE LEVEL</span>
          <span className="custom-values">
            Regular Ice • Light Ice • No Ice • Extra Ice
          </span>
        </div>

        <div className="menu-board-customization-row">
          <span className="custom-label">SWEETNESS LEVEL</span>
          <span className="custom-values">
            100% Sugar • 80% Sugar • 50% Sugar • 30% Sugar • No Sugar
          </span>
        </div>

        <div className="menu-board-customization-row">
          <span className="custom-label">TOPPINGS</span>
          <span className="custom-values">
            +$0.75 Pearls, Coffee Jelly, Pudding, Lychee Jelly · +$1.00 Mango
            Popping Boba, Ice Cream · +$1.25 Crema
          </span>
        </div>
      </div>
    </div>
  );
}
