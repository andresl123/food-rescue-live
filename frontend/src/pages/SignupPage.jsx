import { useState } from "react";
import "./SignupPage.css";
import { createUser } from "../services/userServices";

function SignupPage() {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");

    const result = await createUser(formData);
    if (result.success) {
      setResponseData(result.data);
      setMessage("✅ Signup successful!");
    } else {
      setMessage("⚠️ Signup failed or backend not reachable.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
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

      {responseData && (
        <div className="response-box">
          <h3>Backend Response:</h3>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default SignupPage;
