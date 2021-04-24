import logo from './logo.svg';
import './App.css';
import './LoginForm.js';
/*import Register from './RegisterForm';*/
import './fonts.css';
import Main from './MainField.js';
import Register from "./RegisterForm";
import Login from "./LoginForm";
import LoginForm from "./LoginForm";
import Room from "./Room"

import openSocket from 'socket.io-client';
const socket = openSocket("http://25.74.123.131:8080");
socket.on('get rooms', rooms => {
    console.log(rooms);
} ) ;
socket.emit("create room");

function App() {

  return (

     <Room></Room>
  );
}

export default App;
