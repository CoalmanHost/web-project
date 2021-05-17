import React from 'react';
import "./Room.css";
import mainsocket from "./Mainsocket";

import {Component} from 'react';

class Room extends Component {
    render() {
        return (
            <div className={"container-room"} id = "play-room">
                <div className={"icons"}>

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
                    <div className={"wins-icons"} id={"enemy-win"}>
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
                    <div id={"win-message"}>
                        <span id={"win-text"}>Победил: </span>
                        <button id={"leave-room"}>Выйти</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Room;
