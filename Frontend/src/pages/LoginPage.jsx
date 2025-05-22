import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {ToastContainer, toast} from "react-toastify";
import "./LoginPage.css";
import plantHall from "../assets/plant-hall.jpg";
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
console.log("ENV backend URL:", process.env.REACT_APP_BACKEND_URL);


const LoginPage = ({ setUserRole}) => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState({
        email: "",
        password: "",
    });
    const {email, password} = inputValue;
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
            const {data} =await axios.post(
                `${backendUrl}/login`,
                {
                    ...inputValue
                },
                {withCredentials: true}
            );
            console.log(data);
            const {success, message, role, token} = data;
            if (success) {
                localStorage.setItem("userRole", role);
                localStorage.setItem("token", token);
                setUserRole(role); // MANUAL REFRESH ISSUE FIX
                toast.success(message, {position: "bottom-left"});
                setTimeout(() => {
                    navigate("/");
                }, 1000);
            }
            else {
                toast.error(message, {position: "bottom-left"});
            }
        }
        // If the user was unable to login, display an error message
        catch (error) {
            console.log(error);
            toast.error("Login failed, please try again", {position: "bottom-left"});
        }
        setInputValue ({
            ...inputValue,
            email: "",
            password: "",
        });
    };
    return (
        /*<div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email">Email</label>
              <input 
                type="email" 
                name="email"
                value={email}
                placeholder="Email" 
                onChange={handleOnChange}/>
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={password}
                  placeholder="Password"
                  onChange={handleOnChange} required />
              </div>
                <button type="submit">Login</button>
                <span>New? Make an account here <Link to={"/register"}>Register</Link>
                </span>
            </form>
            <ToastContainer />
        </div>*/
    <div className="login-page">
        <div className="login-left">
            <img
                src= {plantHall}
                className="login-image"
            />
        </div>
        <div className="login-right">
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleSubmit} className="login-form">
                <label htmlFor="email">Email</label>
                <input 
                    type="email" 
                    name="email"
                    value={email}
                    placeholder="Email" 
                    onChange={handleOnChange}
                    required
                />

                <label htmlFor="password">Password</label>
                <input 
                    type="password" 
                    name="password"
                    value={password}
                    placeholder="Password"
                    onChange={handleOnChange}
                    required 
                />

                <button type="submit">Login</button>
                <p className="register-link">
                    New? Make an account <Link to="/register">here</Link>.
                </p>

                <p className="register-link">
                    Forgot Password? Click <Link to="/forgot-password">here</Link>.
                </p>
                </form>
            </div>
            <ToastContainer />
        </div>
    </div>  
    );
};

export default LoginPage;
