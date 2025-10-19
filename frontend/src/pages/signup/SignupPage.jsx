import { useState } from "react";
import { useNavigate } from "react-router-dom";
import signupImage from "../../assets/signupPage.png";
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

  const [addressResponse, setAddressResponse] = useState(null);
  const [userResponse, setUserResponse] = useState(null);
  const [selectedTab, setSelectedTab] = useState("signup");

  // Handle form field changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle signup process
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setAddressResponse(null);
    setUserResponse(null);

    try {
      // Step 1: Create address first
      const addressPayload = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      };

      const createdAddress = await createAddress(addressPayload);

      // Step 2: Create user using the service
      const userPayload = {
        ...formData,
        defaultAddressId: createdAddress.id,
      };

      const result = await createUser(userPayload);

      // Step 3: Handle different outcomes
      if (result.success) {
        toast.success("User created successfully. Please log in.");
        console.log("User created successfully:", result.data);

        // Reset form fields
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

        // Switch to login tab after success
        setSelectedTab("login");
      } else {
        toast.error(`Signup failed: ${result.error}`);
        console.error("Signup failed:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please check console logs.");
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

        {/* Right section */}
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
                onChange={() => setSelectedTab("signup")}
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

            {selectedTab === "signup" ? (
              <SignupForm
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />
            ) : (
              <LoginForm />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
