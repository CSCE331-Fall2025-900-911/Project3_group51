import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuImage,
} from "../api/menu";
import "./MenuManagementScreen.css";

const emptyForm = {
  drinkname: "",
  category: "",
  ingredient: "",
  price: "",
  image: "",
};

export default function MenuManagementScreen() {
  const [menuItems, setMenuItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [imageData, setImageData] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getMenu()
      .then((data) => {
        if (active) {
          setMenuItems(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load menu", err);
        setStatus({ type: "error", message: "Failed to load menu items." });
      });
    return () => {
      active = false;
    };
  }, []);

  const sortedItems = useMemo(
    () =>
      [...menuItems].sort((a, b) => {
        if (a.drinkid && b.drinkid) return a.drinkid - b.drinkid;
        return a.drinkname.localeCompare(b.drinkname);
      }),
    [menuItems]
  );

  const handleInputChange = (evt) => {
    const { name, value } = evt.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedId(null);
    setImageData("");
  };

  const setError = (message) => setStatus({ type: "error", message });
  const setInfo = (message) => setStatus({ type: "info", message });

  const parsePayload = () => {
    const trimmed = {
      drinkname: form.drinkname.trim(),
      category: form.category.trim(),
      ingredient: form.ingredient.trim(),
      price: form.price.trim(),
      image: form.image.trim(),
    };

    if (!trimmed.drinkname || !trimmed.category) {
      throw new Error("Name and category are required.");
    }

    const ingredient = Number.parseInt(trimmed.ingredient, 10);
    if (Number.isNaN(ingredient) || ingredient < 0) {
      throw new Error("Ingredients must be a non-negative whole number.");
    }

    const price = Number.parseFloat(trimmed.price);
    if (Number.isNaN(price) || price < 0) {
      throw new Error("Price must be a non-negative number.");
    }

    return {
      drinkname: trimmed.drinkname,
      category: trimmed.category,
      ingredient,
      price: Number(price.toFixed(2)),
      image: trimmed.image,
    };
  };

  const maybeUploadImage = async () => {
    if (!imageData || !form.image) return null;
    const { filename } = await uploadMenuImage(form.image, imageData);
    return filename;
  };

  const handleAddItem = async () => {
    try {
      setLoading(true);
      const payload = parsePayload();
      const uploadedName = await maybeUploadImage();
      const finalPayload = uploadedName ? { ...payload, image: uploadedName } : payload;
      const { id } = await createMenuItem(finalPayload);
      setMenuItems((prev) => [...prev, { ...finalPayload, drinkid: id }]);
      setInfo(`Added ${finalPayload.drinkname}.`);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add menu item.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedId) {
      setError("Select an item to edit.");
      return;
    }
    try {
      setLoading(true);
      const payload = parsePayload();
      const uploadedName = await maybeUploadImage();
      const finalPayload = uploadedName ? { ...payload, image: uploadedName } : payload;
      await updateMenuItem(selectedId, finalPayload);
      setMenuItems((prev) =>
        prev.map((item) =>
          item.drinkid === selectedId ? { ...item, ...finalPayload } : item
        )
      );
      setInfo(`Updated ${finalPayload.drinkname}.`);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to edit menu item.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedId) {
      setError("Select an item to delete.");
      return;
    }
    const target = menuItems.find((item) => item.drinkid === selectedId);
    if (!target) return;
    const confirmed = window.confirm(
      `Delete ${target.drinkname}? This cannot be undone.`
    );
    if (!confirmed) return;
    try {
      setLoading(true);
      await deleteMenuItem(selectedId);
      setMenuItems((prev) =>
        prev.filter((item) => item.drinkid !== selectedId)
      );
      setInfo(`Deleted ${target.drinkname}.`);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete menu item.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRow = (item) => {
    setSelectedId(item.drinkid);
    setForm({
      drinkname: item.drinkname ?? "",
      category: item.category ?? "",
      ingredient: (item.ingredient ?? "").toString(),
      price: (item.price ?? "").toString(),
      image: item.image ?? "",
    });
    setImageData("");
    setStatus({ type: "", message: "" });
  };

  const handleFileChange = (evt) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file.name }));
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result || "").toString().split(",").pop();
      setImageData(base64 || "");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="menu-mgmt">
      <header className="menu-mgmt__header">
        <button className="menu-mgmt__back" onClick={() => navigate("/management")}>
          ← Back
        </button>
        <h1>Menu Management</h1>
      </header>

      {status.message && (
        <div
          className={`menu-mgmt__status ${
            status.type === "error" ? "error" : "info"
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="menu-mgmt__table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Drink Name</th>
              <th>Category</th>
              <th>Ingredients</th>
              <th>Price</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr
                key={item.drinkid}
                className={
                  item.drinkid === selectedId ? "selected" : undefined
                }
                onClick={() => handleSelectRow(item)}
              >
                <td>{item.drinkid}</td>
                <td>{item.drinkname}</td>
                <td>{item.category}</td>
                <td>{item.ingredient}</td>
                <td>${Number(item.price).toFixed(2)}</td>
                <td>{item.image || "—"}</td>
              </tr>
            ))}
            {!sortedItems.length && (
              <tr>
                <td colSpan="6" className="empty-row">
                  No menu items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="menu-mgmt__form">
        <input
          type="text"
          name="drinkname"
          placeholder="Drink Name"
          value={form.drinkname}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="ingredient"
          placeholder="Ingredients"
          value={form.ingredient}
          onChange={handleInputChange}
          min="0"
        />
        <input
          type="number"
          step="0.01"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleInputChange}
          min="0"
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button onClick={handleAddItem} disabled={loading}>
          Add Item
        </button>
        <button onClick={handleUpdateItem} disabled={loading}>
          Edit Selected
        </button>
        <button onClick={handleDeleteItem} disabled={loading}>
          Delete Selected
        </button>
      </div>
    </div>
  );
}
