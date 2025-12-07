import React, { useEffect, useState } from "react";
import "./MenuBoardScreen.css";

export default function MenuBoardScreen() {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/menu")
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch((err) => console.error("Failed to fetch menu", err));
  }, []);

  const categories = [...new Set(menu.map((item) => item.category))];

  /* CATEGORY → ICON IMAGE MAP */
  const categoryImages = {
    "Milky Series": "classic-milk-green-tea.webp",
    "Fresh Brew": "classic-black.webp",
    "Fruity Beverage": "mango-green-tea.webp",
    "Ice-Blended": "oreo-ice-blended-w-pearls.webp"
  };

  const getBase = (drink) => {
    if (!drink) return "";
    if (drink.toLowerCase().includes("milk")) return "Milk Tea";
    if (drink.toLowerCase().includes("green")) return "Green Tea";
    if (drink.toLowerCase().includes("black")) return "Black Tea";
    return "Tea";
  };

  return (
    <div className="menu-board-container">

      {/* LEFT IMAGE PANEL */}
      <div
        className="menu-board-left"
        style={{
          backgroundImage: `
            url("http://localhost:3000/images/thai-milk-tea-with-pearls.webp"),
            linear-gradient(
              180deg,
              rgba(255,226,217,0.55),
              rgba(255,255,255,0.55)
            )
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />

      {/* RIGHT PANEL */}
      <div className="menu-board-right">

        <div className="menu-board-grid">
          {categories.map((cat) => (
            <div key={cat} className="menu-board-category">
              
              {/* CATEGORY HEADER WITH ICON */}
              <div className="menu-board-title-row">
                <h2 className="menu-board-category-title">{cat}</h2>
                <img
                  className="menu-board-category-icon"
                  src={`http://localhost:3000/images/${categoryImages[cat]}`}
                  alt={cat}
                />
              </div>

              {/* ITEMS */}
              {menu
                .filter((item) => item.category === cat)
                .map((drink) => (
                  <div className="menu-board-item" key={drink.drinkid}>
                    <div className="menu-board-item-info">
                      <span className="menu-board-item-name">{drink.drinkname}</span>
                      <span className="menu-board-item-sub">{getBase(drink.drinkname)}</span>
                    </div>

                    <div className="menu-board-dots" />

                    <span className="menu-board-price">
                      ${Number(drink.price).toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* FOOTER  */}
        <div className="menu-board-footer">
          <div className="footer-line" />

          <div className="footer-row">
            <div className="footer-title">ICE LEVEL</div>
            <div className="footer-options">
              Regular • Light • No Ice • Extra Ice
            </div>
          </div>

          <div className="footer-row">
            <div className="footer-title">SWEETNESS LEVEL</div>
            <div className="footer-options">
              100% • 80% • 50% • 30% • No Sugar
            </div>
          </div>

          <div className="footer-row">
            <div className="footer-title">TOPPINGS</div>
            <div className="footer-options">
              +$0.75 Pearls / Coffee Jelly / Pudding / Lychee Jelly —
              +$1.00 Mango Popping Boba / Ice Cream —
              +$1.25 Crema
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
