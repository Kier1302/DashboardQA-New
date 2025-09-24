import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/Login.css";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/login", { email, password });

      console.log("Login Response:", data); // Debugging log

      if (data && data.token && data.role) {
        localStorage.setItem("token", data.token); // Save token in localStorage
        localStorage.setItem("role", data.role); // Save role in localStorage (optional)

        // Fetch full user details after login to get email and other info
        const userResponse = await api.get("/api/users/me");
        setUser(userResponse.data);

        console.log("Redirecting to: ", data.role === "admin" ? "/admin-dashboard" : "/user-dashboard");

        // Redirect based on the role
        if (data.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.role === "user") {
          navigate("/user-dashboard");
        } else {
          setError("⚠️ Unknown role. Please try again.");
        }
      } else {
        setError("⚠️ Invalid login response.");
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data?.message);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            required
            id="email"       // Added id
            name="email"     // Added name
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
            id="password"    // Added id
            name="password"  // Added name
          />
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {/* 🔹 Register Button */}
        <p className="register-text">Don't have an account?</p>
        <button className="register-button" onClick={() => navigate("/register")}>
          Register
        </button>
      </div>
    </div>
  );
};

export default Login;
