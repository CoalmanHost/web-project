import React from 'react';
import './MainField.css';

const Main = () => {
    function searchRoom() {
        document.getElementById("sf").addEventListener('click', function () {
            const word = document.getElementById("search-field").value;
            const rooms = document.getElementsByClassName("room");
            for (let i = 0; i < rooms.length; i++) {
                if (!rooms[i].classList.contains(word)) {
                    rooms[i].style.display = "none";
                }
            }
        })
    }
    function refreshRooms(){
        document.getElementById("refresh").addEventListener('click', function () {
            const rooms = document.getElementsByClassName("room");
            for (let i = 0; i < rooms.length; i++) {
                    rooms[i].style.display = "block";
            }
        })
    }
    function newRoom() {
        document.getElementById("hide-content").style.display = "flex";
        const body = document.getElementsByTagName("body");
        for (let i = 0; i < body.length; i++) {
            body[i].style.overflow = "invisible";
        }
        document.getElementById("sub").addEventListener('click', function () {
            const room = document.getElementById("room-name").value;
            if (room !== "") {
                const gen = Math.ceil(Math.random() * 100000000);
                document.getElementById("rooms").innerHTML += "<a href = '#'><div class='room " + room + " " + gen + "'> Комната " + room + " (id:" + gen + ")</div></a>";
                document.getElementById("hide-content").style.display = "none";
                const body = document.getElementsByTagName("body");
                for (let i = 0; i < body.length; i++) {
                    body[i].style.overflow = "visible";
                }
            } else {
                alert("You should insert a room name");
            }
        })
        document.getElementById("close").addEventListener('click', function () {
            document.getElementById("hide-content").style.display = "none";
            const body = document.getElementsByTagName("body");
            for (let i = 0; i < body.length; i++) {
                body[i].style.overflow = "visible";
            }
        })
    }

    return (
        <div className="container">
            <div className="name">
                <h1>Игровые комнаты</h1>
                <p>Для начала игры выберите игровую комнату или создайте свою!</p>
                <button className='new-room' onClick={newRoom}>
                    + Создать игровую комнату
                </button>
                <div id={"search"}>
                    <input id={"search-field"} placeholder={"Поиск"}></input>
                    <button id={"sf"} onClick={searchRoom}>Найти</button>
                    <button id={"refresh"} onClick={refreshRooms}>Обновить</button>
                </div>
            </div>
            <div className="rooms" id="rooms">

            </div>
            <div className="footer">
                <h3>Контактная информация</h3>
                <p>Telegram</p>
                <p>Email</p>
                <p>VK</p>
            </div>
            <div id="hide-content">
                <div id="Modal-window">
                    <button id={"close"}>X</button>
                    <div id="form-modal">
                        <label>
                            Введите название комнаты
                            <input name={"room-name"} id="room-name"></input>
                        </label>
                        <label>
                            <input type={"submit"} id={"sub"}></input>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Main;