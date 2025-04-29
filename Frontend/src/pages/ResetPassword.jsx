import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword () {
    const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("https://csc230-project.onrender.com/resetPassword", {
        token,
        newPassword: password,
      });

      if (response.data.success) {
        setMessage("Password reset successful!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage("Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Invalid or expired token.");
    }
  };

    return (
        <div className="reset-password">
          <h2>Reset Your Password</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button type="submit">Reset Password</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      );
}

export default ResetPassword;