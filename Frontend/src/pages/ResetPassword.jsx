// ResetPassword.js
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ResetPassword.css";
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirm) {
            setMessage("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${backendUrl}/resetPassword`, {
                token,
                newPassword: password,
            });

            if (response.data.success) {
                setMessage("Password reset successful! Redirecting...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setMessage("Something went wrong.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Invalid or expired token.");
        }
        setIsLoading(false);
    };

    return (
        <div className="reset-page">
            <div className="reset-container">
                <h2>Reset Your Password</h2>
                <form onSubmit={handleSubmit} className="reset-form">
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
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
                {message && <p className="reset-message">{message}</p>}
            </div>
        </div>
    );
}

export default ResetPassword;
