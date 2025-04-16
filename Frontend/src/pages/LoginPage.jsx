import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {ToastContainer, toast} from "react-toastify";
import "./LoginPage.css";

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
                "http://localhost:4000/login",
                {
                    ...inputValue
                },
                {withCredentials: true}
            );
            console.log(data);
            const {success, message, role} = data;
            if (success) {
                localStorage.setItem("userRole", role)
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
      src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.a8WzazOZQ-Wn1u1RUHwmpgHaE5%26pid%3DApi&f=1&ipt=7d8ae77d3fd2b58895b3eedb66d7c0494659a82950ce0f489311ebee040185b9&ipo=images"
      alt="Scenic login visual"
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
      </form>
    </div>
    <ToastContainer />
  </div>
</div>  
    );
};

export default LoginPage;
