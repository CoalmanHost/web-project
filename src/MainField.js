import React from 'react';
import './MainField.css';
import "./fonts.css";
import Socket from "./Mainsocket";
import {Component} from 'react';

//let Socket = getSocket();
export default class Main extends Component {
    render() {

        function createNewRoom() {
            Socket.createNewRoom();
            console.log("new Room. Our token is: " + Socket.token);
        }

        function joinExistingRoom(room) {
            Socket.socket.emit('join room', room, () => {
                console.log("room");
                window.location.href="/lobby" + room;
            })

        }

        function refreshRooms() {
            console.log("refresh invoked");
            Socket.socket.emit("get rooms", rooms => {
                console.log(rooms);
                const roomPlace = document.getElementById('rooms');
                roomPlace.innerHTML = "";
                for (let i = 0; i < rooms.length; i++) {
                    //console.log(rooms[i]);
                    roomPlace.innerHTML += "<div class='room-main' id='" + rooms[i].toString().substring(4) + "'> Комната id:" + rooms[i].toString().substring(4) + ")</div>";
                }
                document.querySelectorAll(".room-main").forEach(function (item) {
                    console.log(item);
                        item.addEventListener('click', function (){
                            joinExistingRoom(item.id);
                        });
                    }
                )
            })
        }

        function closeRoomChoice() {
            document.getElementById("hide-content").style.display = "none";
            const body = document.getElementsByTagName("body");
            for (let i = 0; i < body.length; i++) {
                body[i].style.overflow = "visible";
            }
        }

        return (
            <div className="container-main" id="main-field">
                <div className="name-main">
                    <h1>Игровые комнаты</h1>
                    <p>Для начала игры выберите игровую комнату или создайте свою!</p>
                    <button className='new-room-main' id={"new--room"} onClick={createNewRoom}>
                        + Создать игровую комнату
                    </button>
                    <div id={"search"}>
                        <input id={"search-field"} placeholder={"Поиск"}></input>
                        <button id={"sf"}>Найти</button>
                        <button id={"refresh"} onClick={refreshRooms}>Обновить</button>
                    </div>
                </div>
                <div className="rooms-main" id="rooms">

                </div>
                <div className="footer-main">
                    <h3>Контактная информация</h3>
                    <p>Telegram</p>
                    <p>Email</p>
                    <p>VK</p>
                </div>
                <div id="hide-content">
                    <div id="Modal-window">
                        <button id={"close"} onClick={closeRoomChoice}>X</button>
                        <div id="form-modal">
                            <label>
                                Введите название комнаты
                                <input name={"room-name"} id="room-name"></input>
                            </label>
                            <label>
                                <input type={"submit"} id={"sub"} value={"Создать"}></input>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

