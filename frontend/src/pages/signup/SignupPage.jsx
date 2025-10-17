import { useState } from "react";
import { useNavigate } from "react-router-dom";
import signupImage from "./img.png";
import { createUser } from "../../services/signupServices";
import SignupForm from "../../components/SignupForm";
import LoginForm from "../../components/LoginForm"; // <-- import your LoginForm
import "./SignupPage.css";

export default function SignupPage() {
  const navigate = useNavigate();
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
  const [selectedTab, setSelectedTab] = useState("signup");

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
    <div className="container-fluid vh-100 px-5">

      <div className="row h-100 g-0">

        {/* Left section with image */}

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

            {/* Signup / Login Button Group */}

           <div
             className="btn-group w-100 mb-3 border border-dark rounded"
             role="group"
             style={{ borderRadius: "15px" }}
           >

             {/* Sign Up Button */}

             <input
               type="radio"
               className="btn-check"
               name="tab"
               id="signupTab"
               autoComplete="off"
               checked={selectedTab === "signup"}
               onChange={() => {
                 setSelectedTab("signup");
                 navigate("/signup");
               }}
             />
             <label
               className="btn w-50 fw-semibold"
               htmlFor="signupTab"
               style={{
                 backgroundColor: selectedTab === "signup" ? "#000" : "#fff",
                 color: selectedTab === "signup" ? "#fff" : "#000",
                 borderRight: "1px solid #212529",
                 transition: "background-color 0.3s ease, color 0.3s ease",
               }}
             >
               Sign Up
             </label>

             {/* Login Button */}

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
                 transition: "background-color 0.3s ease, color 0.3s ease",
               }}
             >
               Login
             </label>
           </div>

            {/* Signup Form */}

            {selectedTab === "signup" ? <SignupForm /> : <LoginForm />}

            {message && (
              <p className="text-center mt-3 text-secondary small">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
