import React from 'react';
import "./Forms.css";
import "./fonts.css";
import password from "./showPass.js";
import {Component} from "react";
import Socket from "./Mainsocket";

export default class Register extends Component{
    render() {
        function registrate(){
            const newUser = {
                    name: document.getElementById("user_name").value,
                    email: document.getElementById("user_email").value,
                    password: document.getElementById("user_password").value
                }
                Socket.moveToMainFromReg(newUser);
        }
        return (
            <div className={"register-page"} id="register-page">
                <div className="register">
                    <h2>Регистрация</h2>
                    <h4>Введите имя</h4>
                    <label>
                        <input name="userName" id={"user_name"} type="text" placeholder="Sith"/>
                    </label>
                    <h4>Введите email</h4>
                    <label>
                        <input name="userEmail" id={"user_email"} type="email" placeholder="ivanovich@gmail.com"/>
                    </label>
                    <h4>Введите пароль</h4>
                    <label>
                        <input name="userPassword" id={"user_password"} className="password-input" type="password" placeholder="123456789"/>
                        <a href="#" id="password-control" onClick={password}></a>
                    </label>
                    <h4>Введите пароль повторно</h4>
                    <label>
                        <input className="password-input" type="password" content="Введите пароль повторно"/>
                    </label>
                    <a href={"/main_room_page"}><input id="registrate" type="button" value="Стать джедаем" onClick={registrate}/></a>
                </div>
            </div>
        );
    }
}