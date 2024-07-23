import React, { useState } from 'react';
import './Css/Loginsignup.css';

const LoginSignup = () => {
    const [state, setState] = useState("Login");
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: ""
    });

    const changeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const login = async () => {
        console.log("Login executed", formData);
        let responseData;
        await fetch('http://localhost:4000/login',{
            method:"Post",
            headers:{
                Accept:'application/form-data',
                'Content-Type':'application/json',
            },
            body:JSON.stringify(formData),

        }).then((response) => response.json()).then((data)=>responseData=data)

        if (responseData.success){
            localStorage.setItem('auth-token',responseData.token);
            window.location.replace("/");
        }
        else{
            alert(responseData.errors)
        } 
    };

    const signup = async () => {
        console.log("Signup executed", formData);
        let responseData;
        await fetch('http://localhost:4000/signup',{
            method:"Post",
            headers:{
                Accept:'application/form-data',
                'Content-Type':'application/json',
            },
            body:JSON.stringify(formData),

        }).then((response) => response.json()).then((data)=>responseData=data)

        if (responseData.success){
            localStorage.setItem('auth-token',responseData.token);
            window.location.replace("/");
        }
        else{
            alert(responseData.errors)
        }
    };

    return (
        <div className="loginsignup">
            <div className="loginsignup-container">
                <h2>{state}</h2>

                {state === "Sign Up" && (
                    <div className="field">
                        <label htmlFor="name"></label>
                        <input
                            type="text"
                            id="name"
                            name="username"
                            value={formData.username}
                            onChange={changeHandler}
                            placeholder='Enter your name'
                        />
                    </div>
                )}

                <div className="field">
                    <label htmlFor="email"></label>
                    <input
                        value={formData.email}
                        onChange={changeHandler}
                        type="email"
                        id="email"
                        name="email"
                        placeholder='Email Address'
                    />
                </div>
                <div className="field">
                    <label htmlFor="password"></label>
                    <input
                        value={formData.password}
                        onChange={changeHandler}
                        type="password"
                        id="password"
                        name="password"
                        placeholder='Password'
                    />
                </div>
                <button onClick={() => { state === "Login" ? login() : signup() }}>
                    Continue
                </button>
                {state === "Sign Up" ? (
                    <p className="loginsignup-login">
                        Already have an account? <span onClick={() => { setState("Login") }}>Login here</span>
                    </p>
                ) : (
                    <p className="loginsignup-login">
                        Create an account? <span onClick={() => { setState("Sign Up") }}>Click here</span>
                    </p>
                )}

                <div className="loginsignup-agree">
                    <input type="checkbox" id="agree" />
                    <label htmlFor="agree">By continuing, I agree to the terms of use & privacy policy.</label>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
