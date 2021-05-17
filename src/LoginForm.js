import React, {useContext} from 'react';
import "./Forms.css";
import "./fonts.css";
import password from "./showPass.js";
import Socket from "./Mainsocket";

import {Component} from 'react';

export default class Login extends Component {

    render() {
        function login (){
            let user = {
                name: document.getElementById("UserID").value,
                password: document.getElementById("password").value
            }
            console.log(user);
            //console.log(props);
            Socket.moveToMainFromLogin(user);
        }
        return (
            <div className={"login-page"} id="login-page">
                <div className="register">
                    <h2>Вход</h2>
                    <h4>Введите логин или почту</h4>
                    <label>
                        <input name="userName" type="text" placeholder="Sith" id="UserID" />
                    </label>
                    <h4>Введите пароль</h4>
                    <label>
                        <input name="userPassword" className="passwordInput" type="password" placeholder="123456789"
                               id="password" />
                        <a href="#" id="password-control" onClick={password}> </a>
                    </label>
                    <input id="button" type="submit" value="Войти" width="50%" onClick={login} />
                    <a id="reg" href={"/register"}>Нет аккаунта? Зарегистрируйтесь!</a>
                </div>
            </div>
        );
    }
}
/*const Login = () => {
    const htmlCode = (
        <div className={"login-page"} id="login-page">
            <Nav className="register">
                <h2>Вход</h2>
                <h4>Введите логин или почту</h4>
                <label>
                    <input name="userName" type="text" placeholder="Sith" id="UserID"></input>
                </label>
                <h4>Введите пароль</h4>
                <label>
                    <input name="userPassword" className="passwordInput" type="password" placeholder="123456789"
                           id="password"></input>
                    <a href="#" id="password-control" onClick={password}></a>
                </label>
                <input id="button" type="submit" value="Войти" width="50%"></input>
                <Nav.Link id="reg" href={"/register"}>Нет аккаунта? Зарегистрируйтесь!</Nav.Link>
            </Nav>
            <Router>
                <Switch>
                    <Route exact path={"/register"} component={Register} />
                </Switch>
            </Router>
        </div>
    );

    /*function get_cookie() {
        console.log("func");
        fetch('/test/success', {method: 'POST'})
            .then(function (response) {
                console.log(response.cookies);
            })
            .then(function (data) {
                console.log('Do what you want => ', data)
            })
            .catch(function (error) {
                console.log(error);
            });
    }*/

/*    return htmlCode;
}
export default Login*/