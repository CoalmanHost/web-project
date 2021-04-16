import React from 'react';
import "./Forms.css";
import "./fonts.css";
import password from "./showPass.js";

const Register = () => {
    return (
        <div className="register">
            <h2>Регистрация</h2>
            <form name="register" method="post" action="" autoComplete="on">
                <h4>Введите имя</h4>
                <label>
                    <input name = "userName" type="text" placeholder="Sith"/>
                </label>
                <h4>Введите email</h4>
                <label>
                    <input name = "userEmail" type="email" placeholder="ivanovich@gmail.com"/>
                </label>
                <h4>Введите пароль</h4>
                <label>
                    <input name = "userPassword" className="password-input" type="password" placeholder="123456789"/>
                        <a href="#" id="password-control" onClick={password}></a>
                </label>
                <h4>Введите пароль повторно</h4>
                <label>
                    <input className="password-input" type="password" content="Введите пароль повторно"/>
                </label>
                <input id="button" type="button" value="Стать джедаем"/>
            </form>
        </div>
);
}
export default Register