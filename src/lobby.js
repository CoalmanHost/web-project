import "./lobby.css";
import  "./Room.css";
import Socket from "./Mainsocket";
import React, {Component} from 'react';


export default class Lobby extends Component {
    render() {

        Socket.socket.on("room full", roomNum => {
            console.log(roomNum);
            document.getElementById("lobby-ready-room").disabled = false;
            document.getElementById("invite-message").innerText = "Игрок найден! Нажми начать";
            document.getElementById("lobby-ready-room").addEventListener('click', function(){
                console.log(window.location.href.substring(27));
                Socket.socket.emit("ready room", window.location.href.substring(27),() => {
                    console.log("board updated");
                });
            })
        });

        return (
            <div id={"lobby-room"}>
                <div className={"Lobby-window"} id={"lobby-window"}>
                    <div className={"Player-progress"}>Лобби {window.location.href.substring(27)}</div>
                    <div className={"player-usernames"} id={"invite-message"}>Ожидаем второго игрока</div>
                    <button disabled id={"lobby-ready-room"} >Начать</button>
                </div>
                <div className={"container-room"} id = "play-room">
                    <div className={"icons"}>
                        <div className={"wins-icons"} id={"enemy-win"}>
                            <span className={"win-bubble"}></span>
                            <span className={"win-bubble"}></span>
                        </div>
                        <div className={"icon"} id={"enemy-icon"}>

                        </div>
                        <div className={"currentAttack"} id={"enemy-current-attack"}>

                        </div>
                        <div className={"effects"}>

                        </div>
                        <div className={"currentAttack"} id={"player-current-attack"}>

                        </div>
                        <div className={"icon"} id={"player-icon"}>

                        </div>
                        <div className={"wins-icons"} id={"player-win"}>
                            <span className={"win-bubble"}></span>
                            <span className={"win-bubble"}></span>
                        </div>

                    </div>
                    <div className={"field"}>
                        <div className={"rows"}>
                            <div className={"myCards"} id={"enemy-Card-Place"}>

                            </div>
                            <div className={"bombardier game-section"} id={"enemy-third"}>

                            </div>
                            <div className={"interceptor game-section"} id={"enemy-second"}>

                            </div>
                            <div className={"cruiser game-section"} id={"enemy-first"}>

                            </div>
                        </div>
                        <div className={"rows"}>
                            <div className={"game-section"} id={"player-first"}>

                            </div>
                            <div className={"game-section"} id={"player-second"}>

                            </div>
                            <div className={"game-section"} id={"player-third"}>

                            </div>
                            <div className={"myCards"} id={"CardPlace"}>

                            </div>
                        </div>

                    </div>
                    <div className={"packages"}>
                        <div className={"package"}> </div>
                        <div className={"buttons"}>
                            <button id={"end-turn"}>Закончить ход</button>
                            <button id={"pass"}>Спасовать</button>
                        </div>
                        <div className={"package"} id={"readyRoom"}> </div>
                    </div>
                    <div id={"win-menu"}>
                        <div id={"blank"}></div>
                        <div id={"win-message"}>
                            <span id={"win-text"}>Победил: </span>
                            <button id={"leave-room"}>Выйти</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}