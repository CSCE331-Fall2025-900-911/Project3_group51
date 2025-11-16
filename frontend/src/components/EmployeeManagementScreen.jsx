import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employees";
import "./EmployeeManagementScreen.css";

const emptyForm = {
  firstname: "",
  lastname: "",
  role: "",
};

const ROLE_OPTIONS = [
  { label: "Employee", value: "Employee" },
  { label: "Manager", value: "Manager" },
];

export default function EmployeeManagementScreen() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getEmployees()
      .then((data) => {
        if (active) setEmployees(data);
      })
      .catch((err) => {
        console.error(err);
        setStatus({
          type: "error",
          message: "Failed to load employees.",
        });
      });
    return () => {
      active = false;
    };
  }, []);

  const sortedEmployees = useMemo(
    () =>
      [...employees].sort((a, b) => {
        if (a.employeeid && b.employeeid) {
          return a.employeeid - b.employeeid;
        }
        return a.firstname.localeCompare(b.firstname);
      }),
    [employees]
  );

  const handleInputChange = (evt) => {
    const { name, value } = evt.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedId(null);
  };

  const setError = (message) => setStatus({ type: "error", message });
  const setInfo = (message) => setStatus({ type: "info", message });

  const parsePayload = () => {
    const normalizedRole = form.role.trim();
    const trimmed = {
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      role: normalizedRole,
    };
    if (!trimmed.firstname || !trimmed.lastname || !trimmed.role) {
      throw new Error("First name, last name, and role are required.");
    }
    const allowed = new Set(["Employee", "Manager"]);
    if (!allowed.has(trimmed.role)) {
      throw new Error("Role must be Employee or Manager.");
    }
    return trimmed;
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      const payload = parsePayload();
      const { id } = await createEmployee(payload);
      setEmployees((prev) => [
        ...prev,
        { ...payload, employeeid: id, role: payload.role },
      ]);
      setInfo(`Added ${payload.firstname} ${payload.lastname}.`);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add employee.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedId) {
      setError("Select an employee to edit.");
      return;
    }
    try {
      setLoading(true);
      const payload = parsePayload();
      await updateEmployee(selectedId, payload);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employeeid === selectedId ? { ...emp, ...payload } : emp
        )
      );
      setInfo(`Updated ${payload.firstname} ${payload.lastname}.`);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update employee.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) {
      setError("Select an employee to delete.");
      return;
    }
    const target = employees.find((emp) => emp.employeeid === selectedId);
    if (!target) return;
    if (
      !window.confirm(
        `Delete ${target.firstname} ${target.lastname}? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await deleteEmployee(selectedId);
      setEmployees((prev) =>
        prev.filter((emp) => emp.employeeid !== selectedId)
      );
      setInfo(`Deleted ${target.firstname} ${target.lastname}.`);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete employee.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRow = (emp) => {
    setSelectedId(emp.employeeid);
    setForm({
      firstname: emp.firstname ?? "",
      lastname: emp.lastname ?? "",
      role: emp.role ?? "",
    });
    setStatus({ type: "", message: "" });
  };

  return (
    <div className="employee-mgmt">
      <header className="employee-mgmt__header">
        <button
          className="employee-mgmt__back"
          onClick={() => navigate("/management")}
        >
          ← Back
        </button>
        <h1>Employee Management</h1>
      </header>

      {status.message && (
        <div
          className={`employee-mgmt__status ${
            status.type === "error" ? "error" : "info"
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="employee-mgmt__table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map((emp) => (
              <tr
                key={emp.employeeid}
                className={
                  emp.employeeid === selectedId ? "selected" : undefined
                }
                onClick={() => handleSelectRow(emp)}
              >
                <td>{emp.employeeid}</td>
                <td>{emp.firstname}</td>
                <td>{emp.lastname}</td>
                <td className="role-cell">
                  {emp.role ? emp.role.charAt(0).toUpperCase() + emp.role.slice(1) : ""}
                </td>
              </tr>
            ))}
            {!sortedEmployees.length && (
              <tr>
                <td colSpan="4" className="empty-row">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="employee-mgmt__form">
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={form.firstname}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={form.lastname}
          onChange={handleInputChange}
        />
        <select
          name="role"
          value={form.role}
          onChange={handleInputChange}
        >
          <option value="" disabled>
            Select Role
          </option>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button onClick={handleAdd} disabled={loading}>
          Add Employee
        </button>
        <button onClick={handleUpdate} disabled={loading}>
          Edit Selected
        </button>
        <button onClick={handleDelete} disabled={loading}>
          Delete Selected
        </button>
      </div>
    </div>
  );
}
