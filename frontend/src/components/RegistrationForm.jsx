import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import Navbar from "./Navbar";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/register", formData);
      if (response.data.success) {
        // navigate to verify page with email as query param (SPA navigation)
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        setMessage(response.data.message || "Registration failed");
      }
    } catch (err) {
      setMessage("Registration failed. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-md mx-auto mt-10 p-6 backdrop-blur-sm rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        {message && <p className="text-black font-bold mb-4">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded transition ease-in-out duration-300 hover:bg-blue-600"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
