import { useState } from "react";
import { createUser } from "../services/userService";

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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");

    const result = await createUser(formData);
    if (result.success) setMessage("✅ Signup successful!");
    else setMessage("⚠️ Signup failed or backend not reachable.");
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <input
            key={key}
            type="text"
            name={key}
            placeholder={key}
            value={formData[key]}
            onChange={handleChange}
            required
          />
        ))}
        <button type="submit">Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SignupPage;
