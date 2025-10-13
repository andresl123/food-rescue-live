import { useState } from "react";
import signupImage from "./signup.png";
import "./SignupPage.css";
import { createUser } from "../../services/signupServices";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    categoryId: "",
    phoneNumber: "",
    defaultAddressId: "",
  });
  const [message, setMessage] = useState("");
  const [responseData, setResponseData] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");
    const result = await createUser(formData);
    if (result.success) {
      setResponseData(result.data);
      setMessage("Signup successful.");
    } else {
      setMessage("Signup failed or backend not reachable.");
    }
  };

  return (
    <div className="signup-layout">
      {/* Left: full-bleed image/GIF */}
      <div className="signup-left">
        {/* Prefer local asset for reliability: place a file at /public/food.gif or /public/food.jpg */}
        <img src={signupImage} alt="Fresh food" className="signup-left-img" />
        <div className="signup-left-overlay" />
        <div className="signup-left-text">
          <h2>Join FoodRescue</h2>
          <p>Connect donors and recipients with speed and transparency.</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="signup-right">
        <div className="signup-container">
            <h1 className="signup-title">FOOD RESCUE LIVE</h1>
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="categoryId"
              placeholder="Category (e.g. donor)"
              value={formData.categoryId}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="defaultAddressId"
              placeholder="Default Address ID"
              value={formData.defaultAddressId}
              onChange={handleChange}
              required
            />
            <button type="submit">Sign Up</button>
          </form>

          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
}
