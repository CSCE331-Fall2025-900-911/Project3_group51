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
    <div className="menu-board-container">
      {Object.entries(grouped).map(([category, items]) => {

        // Use the FIRST drink image in this category as the category image
        const categoryImage = items[0]?.image
          ? `${import.meta.env.VITE_API_URL.replace("/api", "")}/images/${items[0].image}`
          : null;

        return (
          <div key={category} className="menu-board-section">
            
            {/* Category Header */}
            <h2 className="menu-board-category">{category}</h2>

            {/* Category Image */}
            {categoryImage && (
              <img
                src={categoryImage}
                alt={category}
                className="menu-board-category-image"
              />
            )}

            {/* Items */}
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
  );
}
