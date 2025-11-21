import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import CompleteSignupForm from "./CompleteSignupForm";

const BFF_BASE_URL = import.meta.env.VITE_BFF_BASE_URL || "http://localhost:8090";

export default function CompleteSignupPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // from navigate("/complete-signup", { state: { userId, email, name } })
  const { state } = location || {};
  const { userId, email, name } = state || {};

  const [formData, setFormData] = useState({
    password: "",
    categoryId: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  // If someone opens this page directly without state, redirect them
  if (!userId || !email) {
    // you can also show a nicer message instead of redirect
    // but this avoids crashes
    navigate("/authentication");
  }

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    try {
      const resp = await axios.post(
        `${BFF_BASE_URL}/api/google/complete`,
        {
          userId,
          password: formData.password,
          categoryId: formData.categoryId,
          phoneNumber: formData.phoneNumber,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        { withCredentials: true }
      );

      const { success, data, message } = resp.data;
      if (!success) {
        toast.error(message || "Could not complete signup");
        return;
      }

      toast.success("Signup completed!");
      // tokens are set by BFF in cookies
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <h3 className="mb-3 text-center">Complete Your Profile</h3>

      <CompleteSignupForm
        provisionalUser={{ name, email }}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
