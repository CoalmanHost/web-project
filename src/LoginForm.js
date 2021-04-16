import React from 'react';
import "./Forms.css";
import "./fonts.css";
import password from "./showPass.js";

const Login = () => {
    return (
        <div className="register">
            <h2>Вход</h2>
            <form name="register" method="post" action="">
                <h4>Введите логин или почту</h4>
                <label>
                    <input type="text" placeholder="Sith"></input>
                </label>
                <h4>Введите пароль</h4>
                <label>
                    <input className="password-input" type="password" placeholder="123456789"></input>
                    <a href="#" id="password-control" onClick={password}></a>
                </label>
                <input id="button" type="button" value="Войти" width="50%"></input>
            </form>
            <a id="reg" href="register-page.html">Нет аккаунта? Зарегистрируйтесь!</a>
        </div>

    );
}
export default Login