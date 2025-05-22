// This will check if a user enters a valid email.
// If so, send a link to reset their password
import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {ToastContainer, toast} from "react-toastify";
import "./ForgotPassword.css";
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState({
        email: "",
    });
    const {email} = inputValue;
    const handleOnChange = (e) => {
        const {name, value} = e.target;
        setInputValue({
            ...inputValue,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const {data} = await axios.post(
                `${backendUrl}/forgotPassword`,
                {
                    ...inputValue
                },
                {withCredentials: true}
            );
            console.log(data);
            const {success} = data;

            if (success) {
                // If we have your email, we'll send you a link to reset your password
                toast.success("If we have your information, we'll send you a link to reset your password", {position: "bottom-left"});
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            }
            else {
                toast.error("An error has occurred. Please try again", {position: "bottom-left"});
            }
        }
        catch (error) {
            console.log(error)
            toast.error("Something went wrong, please try again", {position: "bottom-left"});
        }
        setInputValue ({
            ...inputValue,
            email: ""
        });
    }

    return (
      <div className="forgot-page">
        <div className="forgot-center">
            <div className="forgot-container">
                <h2>Forgot Password</h2>
                <form onSubmit={handleSubmit} className="forgot-form"> 
                    <label htmlFor="email">Email</label>
                    <input 
                        type="email" 
                        name="email"
                        value={email}
                        placeholder="Email" 
                        onChange={handleOnChange}
                        required
                    />
                    <button type="submit">Reset Password</button>
                
                </form>
            </div>
            <ToastContainer />

        </div>

      </div>
    );
  };

export default ForgotPassword;

