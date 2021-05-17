import './App.css';
import './LoginForm.js';
import Register from './RegisterForm';
import './fonts.css';
import Main from './MainField.js';
import Login from "./LoginForm";
import Room from "./Room"
import "./lobby.css";
import Lobby from "./lobby";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import React from "react";
/*import "/public/StarJedi.ttf";*/

function App() {
    return (
            <Router>
                <Switch>
                    <Route exact path={"/"} component={Login}/>
                    <Route exact path={"/register"} component={Register}/>
                    <Route exact path={"/main_room_page"} component={Main}/>
                    <Route path={"/lobby:room"} component={Lobby}/>
                    {/*<Route path={"/playing-room:room"} component={Room}/>*/}
                </Switch>
            </Router>
    );
}

export default App;
