import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "./Register.css"
import plantHall from "../assets/plant-hall.jpg";
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const Register = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    //role: "",
  });

  const { firstName, lastName, email, password} = inputValue; //role } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) =>
    toast.error(err, { position: "bottom-left" });

  const handleSuccess = (msg) =>
    toast.success(msg, { position: "bottom-left" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password.length < 6) {
        handleError("Password Must be More than 6 characters in length")
      }
      else if (!(/[^a-zA-Z0-9]/.test(password))) {
        handleError ("Password Must Contain At Least One Special Character")
      }
      else if (!(/\d/.test(password))) {
        handleError ("Password Must contain at least one digit")
      }
      else {
        const { data } = await axios.post(
          `${backendUrl}/signup`,
          {
            ...inputValue,
          },
          { withCredentials: true }
        );
        const { success, message } = data;
        if (success) {
          handleSuccess(message);
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          handleError(message);
        }
      }
    } catch (error) {
      console.log(error);
    }
    setInputValue({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      //role: "",
    });
  };

  return (
    /*<div className="form_container">
      <h2>Signup Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            name="firstName"
            value={firstName}
            placeholder="Enter your first name"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={lastName}
            placeholder="Enter your last name"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            placeholder="Enter your email"
            onChange={handleOnChange}
          />
        </div>
        
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            placeholder="Enter your password"
            onChange={handleOnChange}
          />
        </div>
        <button type="submit">Submit</button>
        <span>
          Already have an account? <Link to={"/login"}>Login</Link>
        </span>
      </form>
      <ToastContainer />
    </div>*/
    <div className="register-page">
        <div className="register-left">
            <img
              src= {plantHall}
              alt="Scenic login visual"
              className="register-image"
            />
        </div>
        <div className="register-right">
            <div className="register-container">
                <h2>Register Your CIRT Account!</h2>
                <form onSubmit={handleSubmit} className="register-form">
                <label htmlFor="firstName">First Name</label>
                <input 
                    type="text" 
                    name="firstName"
                    value={firstName}
                    placeholder="First Name" 
                    onChange={handleOnChange}
                    required
                />
                <label htmlFor="lastName">Last Name</label>
                <input 
                    type="text" 
                    name="lastName"
                    value={lastName}
                    placeholder="Last Name" 
                    onChange={handleOnChange}
                    required
                />
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
    
                <button type="submit">Register</button>
                <p className="login-link">
                    Already Have An Account? Login <Link to="/login">here</Link>.
                </p>
                </form>
                </div>
                <ToastContainer />
          </div>
    </div>  
  );
};

export default Register;
