import { useState } from "react";
import { useNavigate } from "react-router-dom";
import signupImage from "./img.png";
import { createUser } from "../../services/signupServices";
import SignupForm from "../../components/SignupForm";
import LoginForm from "../../components/LoginForm";
import { createAddress } from "../../services/addressService";
import "./SignupPage.css";
import toast from "react-hot-toast";

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    categoryId: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [message, setMessage] = useState("");
  const [addressResponse, setAddressResponse] = useState(null);
  const [userResponse, setUserResponse] = useState(null);
  const [selectedTab, setSelectedTab] = useState("signup");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setMessage("Submitting...");
    setAddressResponse(null);
    setUserResponse(null);

    try {
      const addressPayload = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      };

      const createdAddress = await createAddress(addressPayload);

      const userPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        categoryId: formData.categoryId,
        phoneNumber: formData.phoneNumber,
        defaultAddressId: createdAddress.id,
      };

      const response = await fetch("http://localhost:8080/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload),
      });

      const result = await response.json();
      setUserResponse(result);

      if (response.ok) {
        toast.success("Signup successful! Redirecting to login...");

        setFormData({
          name: "",
          email: "",
          password: "",
          categoryId: "",
          phoneNumber: "",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          defaultAddressId: "",
        });

        setTimeout(() => {
          navigate("/authentication");
        }, 1500);
      } else {
        toast.error(`Signup failed — ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong — check console logs.");
    }
  };

  return (
    <div className="container-fluid vh-100 px-5">

      <div className="row h-100 g-0">
        {/* Left section */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center p-4">
          <div className="position-relative w-100 h-100">
            <img
              src={signupImage}
              alt="Food Rescue"
              className="w-100 h-100 object-fit-cover"
              style={{ borderRadius: "30px" }}
            />
            <div className="position-absolute top-50 start-50 translate-middle text-center text-white px-4">
              <h1 className="fw-bold display-4">Join FoodRescue</h1>
              <p className="fs-5">
                Connect donors and recipients with speed and transparency.
              </p>
            </div>
          </div>
        </div>

        {/* Right section with form */}

        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light form-section">
          <div className="w-100 mx-3" style={{ maxWidth: "470px" }}>
            <h2 className="text-center fw-bold mb-4" style={{ color: "#000" }}>
              Food Rescue Live
            </h2>

            {/* Tabs */}
            <div className="btn-group w-100 mb-3 border border-dark rounded">
              <input
                type="radio"
                className="btn-check"
                name="tab"
                id="signupTab"
                autoComplete="off"
                checked={selectedTab === "signup"}
                onChange={() => {
                  setSelectedTab("signup");
                }}
              />
              <label
                className="btn w-50 fw-semibold"
                htmlFor="signupTab"
                style={{
                  backgroundColor: selectedTab === "signup" ? "#000" : "#fff",
                  color: selectedTab === "signup" ? "#fff" : "#000",
                  borderRight: "1px solid #212529",
                }}
              >
                Sign Up
              </label>

              <input
                type="radio"
                className="btn-check"
                name="tab"
                id="loginTab"
                autoComplete="off"
                checked={selectedTab === "login"}
                onChange={() => setSelectedTab("login")}
              />
              <label
                className="btn w-50 fw-semibold"
                htmlFor="loginTab"
                style={{
                  backgroundColor: selectedTab === "login" ? "#000" : "#fff",
                  color: selectedTab === "login" ? "#fff" : "#000",
                }}
              >
                Login
              </label>
            </div>

            {selectedTab === "signup" ? <SignupForm
                                                      formData={formData}
                                                      onChange={handleChange}
                                                      onSubmit={handleSubmit}
                                                    /> : <LoginForm />}

            {message && (
              <p className="text-center mt-3 text-secondary small">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
