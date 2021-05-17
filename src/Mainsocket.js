import openSocket from "socket.io-client";

let cleanSpace = ["enemy-current-attack", "player-current-attack", "enemy-Card-Place", "enemy-third", "enemy-second", "enemy-first", "player-first", "player-second", "player-third", "CardPlace"];

class Mainsocket {
    Room;
    myTurn;
    token;
    socket = openSocket("http://25.74.123.131:8080", {
        transports: ['websocket'],
        reconnection: false
    });

    constructor() {
        console.log("New socket " + this.socket.id);
        this.socket.on("connect", () => {
            console.log("connected");
        })
        console.log(sessionStorage);
        if (!sessionStorage.hasOwnProperty("token")) {
            this.socket.on("throw token", UserToken => {
                this.token = UserToken;
                console.log(this.token);
                sessionStorage.setItem("token", UserToken);
                this.socket.emit("init user", this.token, () => {
                    window.location.href = "/main_room_page";
                });
            })
        } else {
            console.log("emit with token: " + sessionStorage.getItem("token"));
            this.socket.emit("init user", sessionStorage.getItem("token"));
         }
        // this.socket.on("room full", roomNum => {
        //     console.log(roomNum);
        //     document.getElementById("lobby-ready-room").disabled = false;
        //     document.getElementById("invite-message").innerText = "Игрок найден! Нажми начать";
        //     document.getElementById("lobby-ready-room").addEventListener('click', function(){
        //         console.log(window.location.href.substring(27));
        //         Socket.socket.emit("ready room", window.location.href.substring(27),() => {
        //             console.log("board updated");
        //             window.location.href = "/playing-room" + window.location.href.substring(27);
        //         });
        //     })
        // });
        this.socket.on("board update", (board, id) => {
            document.getElementById("lobby-window").style.display ="none";
            document.getElementById("play-room").style.display="flex";
            this.createField(board, id);
        });
        this.socket.on("game end", winnerID => {
            this.socket.emit("get name", winnerID, (playerName) => {
                console.log(playerName);
                document.getElementById("win-menu").style.display = "flex";
                document.getElementById("win-text").innerText += playerName;
                document.getElementById("leave-room").addEventListener("click", function () {
                    Socket.socket.emit("leave room", Socket.Room);
                    window.location.href = "/main_room_page";
                })
            })
        })
    }

    createField(board, id){
        for (let cleanId = 0; cleanId < cleanSpace.length; cleanId++) {
            document.getElementById(cleanSpace[cleanId]).innerHTML = "";
        }
        let br = Object.fromEntries(Object.entries(board));
        this.Room = br["id"];
        let currentPlayer;
        let disabled;
        if (br["playersTurn"][id] === true) {
            currentPlayer = document.getElementById("player-icon");
            disabled = document.getElementById("enemy-icon");
        } else {
            disabled = document.getElementById("player-icon");
            currentPlayer = document.getElementById("enemy-icon");
        }
        disabled.style.padding = "0";
        disabled.style.boxShadow = "0 0 0";
        currentPlayer.style.padding = "15px";
        currentPlayer.style.boxShadow = "0 0 50px orange";

        console.log(br);
        //console.log(br["playerIds"][0]);
        this.myTurn = br["playersTurn"][id];
        this.GameLogic();
        this.getHands(br["sides"], id);
        this.getRows(br["sides"], id);
    }

    moveToMainFromLogin(user) {
        this.socket.emit('login', user);
    }

    moveToMainFromReg(user) {
        this.socket.emit("new user", user);
    }

    createNewRoom() {
        this.socket.emit("create room", room_Num => {
            console.log(room_Num);
            window.location.href = "/lobby" + room_Num;
        });
    }

    GameLogic() {
        let old_end_turn = document.getElementById("end-turn");
        let new_end_turn = old_end_turn.cloneNode(true);
        old_end_turn.parentNode.replaceChild(new_end_turn, old_end_turn);

        let old_pass = document.getElementById("pass");
        var new_pass = old_pass.cloneNode(true);
        old_pass.parentNode.replaceChild(new_pass, old_pass);

        // console.log("Asked for some logic");
        //document.getElementById("readyRoom").addEventListener('click', function (o, properties) {
        // msocket.socket.emit("ready room", room_Num);
        //console.log("ready room");
        if (this.myTurn === true) {
            document.getElementById("end-turn").addEventListener('click', function () {
                console.log("end-turn " + Socket.Room);
                console.log("END-TURN");
                Socket.socket.emit("turn end", Socket.Room);
            })
            document.getElementById("pass").addEventListener('click', function () {
                // console.log("pass " + Room);
                console.log("PASS");
                Socket.socket.emit("fight ready", Socket.Room);
            })
        }
    }

    getHands(sides, playerID) {
        console.log(sides);
        for (let side in sides) {
             console.log(sides[side]);
            // console.log(sides[side]["playerId"]);
            if (sides[side]["playerId"] !== playerID) {
                //console.log("enemy!");
                this.addBlankCard(sides[side]["handCards"].length);
                document.getElementById("enemy-current-attack").innerHTML = "<div class = 'currentAttackWindow'>" + sides[side]["attackPower"] + "</div>";
                this.addBubbles("enemy-win", sides, side);
            } else {
                //console.log("player!");
                this.addPlayerCard(sides[side]["handCards"]);
                document.getElementById("player-current-attack").innerHTML = "<div class = 'currentAttackWindow'>" + sides[side]["attackPower"] + "</div>";
                this.addBubbles("player-win", sides, side);
            }
        }
    }

    addBubbles(id, sides, side){
        let plate = document.getElementById(id);
        let win_bubbles = plate.childNodes;
        for (let i = 0; i < sides[side]["wins"]; i++){
            win_bubbles.item(i).style.backgroundColor = "red";
        }
    }

    getRows(sides, playerID) {
        for (let side in sides) {
            let id = "player";
            if (sides[side]["playerId"] !== playerID) {
                id = "enemy";
            }
            for (let i = 0; i < sides[side]["firstLine"].length; i++) {
                let classes = "card " + sides[side]["firstLine"][i]["id"] + " " + sides[side]["firstLine"][i]["typeLine"];
                if (sides[side]["firstLine"][i]["isEffectActive"]) {
                    classes += "isEffectActive";
                }
                document.getElementById(id + "-first").innerHTML += "<div class='" + classes + "'><span class = 'card-value' >" + sides[side]["firstLine"][i]["value"] + "</span> <span class='card-name'>" + sides[side]["firstLine"][i]["name"] + "</span> </div>";
            }
            for (let i = 0; i < sides[side]["secondLine"].length; i++) {
                let classes = "card " + sides[side]["secondLine"][i]["id"] + " " + sides[side]["secondLine"][i]["typeLine"];
                if (sides[side]["secondLine"][i]["isEffectActive"]) {
                    classes += "isEffectActive";
                }
                document.getElementById(id + "-second").innerHTML += "<div class='" + classes + "'><span class = 'card-value' >" + sides[side]["secondLine"][i]["value"] + "</span> <span class='card-name'>" + sides[side]["secondLine"][i]["name"] + "</span> </div>";
            }
            for (let i = 0; i < sides[side]["thirdLine"].length; i++) {
                let classes = "card " + sides[side]["thirdLine"][i]["id"] + " " + sides[side]["thirdLine"][i]["typeLine"];
                if (sides[side]["thirdLine"][i]["isEffectActive"]) {
                    classes += "isEffectActive";
                }
                //console.log(handCards[i]);
                document.getElementById(id + "-third").innerHTML += "<div class='" + classes + "'><span class = 'card-value' >" + sides[side]["thirdLine"][i]["value"] + "</span> <span class='card-name'>" + sides[side]["thirdLine"][i]["name"] + "</span> </div>";
            }
        }
    }

    addBlankCard(cardAmount) {
        //console.log("added blank cards");
        for (let i = 0; i < cardAmount; i++) {
            document.getElementById("enemy-Card-Place").innerHTML += "<div class='blank-card'></div>"
        }
    }

    addPlayerCard(handCards) {
        //console.log("added player's cards");
        for (let i = 0; i < handCards.length; i++) {
            let classes = "card hand " + handCards[i]["id"] + " " + handCards[i]["typeLine"];
            if (handCards[i]["isEffectActive"]) {
                classes += "isEffectActive";
            }
            //console.log(handCards[i]);
            const gen = Math.ceil((Math.random() * 1000000));
            document.getElementById('CardPlace').innerHTML += "<div class = '" + classes + "' id='" + gen + "'><span class = 'card-value' >" + handCards[i]["value"] + "</span> <span class='card-name'>" + handCards[i]["name"] + "</span></div>";
            /*document.getElementById(gen).addEventListener('click', function(){
                msocket.putCard(gen);
            })*/
        }
        console.log(this.myTurn);
        if (this.myTurn === true) {
            document.querySelectorAll('.hand').forEach(function (item) {
                item.addEventListener('click', function () {
                    Socket.putCard(item.id);
                })
            })
        }
    }

    putCard(id) {
        console.log("Clicked card:" + id);
        const card = document.getElementById(id);
        /*let cardPlace = "player-"+card.classList[2];
        console.log(cardPlace);
        document.getElementById(cardPlace).innerHTML += card.outerHTML;
        document.getElementById("CardPlace").removeChild(card);*/
        console.log(this.Room, card.classList[1], card.classList[2]);
        this.socket.emit("put card", this.Room, card.classList[2], card.classList[3]);
    }
}

let
    Socket = new Mainsocket();
export default Socket;

/*let socket;
function getSocket() {
    if (socket) {
        return socket;
    }
    else {
        socket = new openSocket("http://25.74.123.131:8080", {
            transports: ['websocket'],
            reconnection: false
        });
        return socket;
    }
}
export default getSocket;*/


/*export const Socket = new openSocket("http://25.74.123.131:8080", {
    transports: ['websocket'],
    reconnection: false
});*/


// import openSocket from 'socket.io-client';
// import "./Room.css";
//
// let Room;
// let myTurn;
//
// let cleanSpace = ["enemy-current-attack", "player-current-attack", "enemy-Card-Place", "enemy-third", "enemy-second", "enemy-first", "player-first", "player-second", "player-third", "CardPlace"];
//
// class mainsocket {
//     socket
//
//     constructor() {
//         this.socket = openSocket("http://25.74.123.131:8080", {
//             transports: ['websocket'],
//             reconnection: false
//         });
//     }
// }
//
// let currToken = null;
// const msocket = new mainsocket();
// msocket.socket.on("connect", () => {
//         msocket.socket.on("board update", (board, id) => {
//            /* document.getElementById("lobby-room").style.display = "none";
//             document.getElementById("play-room").style.display = "flex";
//             document.getElementById("win-menu").style.display = "none";*/
//             for (let cleanId = 0; cleanId < cleanSpace.length; cleanId++) {
//                 //console.log(cleanSpace[cleanId]);
//                 document.getElementById(cleanSpace[cleanId]).innerHTML = "";
//             }
//             console.log("socket worked right!");
//             //console.log(JSON.stringify(board));
//             /*console.log(JSON.stringify(board["id"]));*/
//             let br = Object.fromEntries(Object.entries(board));
//             Room = br["id"];
//             let currentPlayer;
//             let disabled;
//             if (br["playersTurn"][id] === true) {
//                 currentPlayer = document.getElementById("player-icon");
//                 disabled = document.getElementById("enemy-icon");
//             } else {
//                 disabled = document.getElementById("enemy-icon");
//                 currentPlayer = document.getElementById("enemy-icon");
//             }
//             disabled.style.padding = "0";
//             disabled.style.boxShadow = "0 0 0";
//             currentPlayer.style.padding = "15px";
//             currentPlayer.style.boxShadow = "0 0 50px orange";
//
//             console.log(br);
//             //console.log(br["playerIds"][0]);
//             console.log(br["playersTurn"][id]);
//             myTurn = br["playersTurn"][id];
//             GameLogic();
//             getHands(br["sides"], id);
//             getRows(br["sides"], id);
//         })
//     msocket.socket.on("game end", winnerID => {
//         msocket.socket.emit("get name",  winnerID, (playerName) => {
//             console.log(playerName);
//             document.getElementById("win-menu").style.display = "flex";
//             document.getElementById("win-text").innerText += playerName;
//             document.getElementById("leave-room").addEventListener("click", function (){
//                 msocket.socket.emit("leave room", Room);
//                 /*document.getElementById("play-room").style.display = "none";
//                 document.getElementById("main-field").style.display = "flex";*/
//                 toRoom();
//             })
//         })
//     })
//         // document.getElementById("register-page").style.display = "none";
//         // document.getElementById("main-field").style.display = "none";
//         // document.getElementById("play-room").style.display = "none";
//         document.getElementById("reg").addEventListener('click', function () {
//             /*document.getElementById("login-page").style.display = "none";
//             document.getElementById("register-page").style.display = "flex";*/
//             document.getElementById("registrate").addEventListener('click', function () {
//                 console.log("to register");
//                 const newUser = {
//                     name: document.getElementById("user_name").value,
//                     email: document.getElementById("user_email").value,
//                     password: document.getElementById("user_password").value
//                 }
//                 msocket.socket.emit("register", newUser);
//                 /*document.getElementById("register-page").style.display = "none";
//                 document.getElementById("main-field").style.display = "flex";*/
//                 msocket.socket.on("throw token", token => {
//                     currToken = token;
//                     console.log(currToken);
//                     msocket.socket.emit("init user", token);
//                 })
//                 toRoom();
//             })
//         });
//         console.log("Connected");
//         const listener = function () {
//             let user = {
//                 name: document.getElementById("UserID").value,
//                 password: document.getElementById("password").value
//             }
//             //console.log(user);
//             msocket.socket.emit('login', user);
//             /*document.getElementById("login-page").style.display = "none";
//             document.getElementById("main-field").style.display = "flex";*/
//             msocket.socket.on("throw token", token => {
//                 currToken = token;
//                 console.log(currToken);
//                 msocket.socket.emit("init user", token);
//             })
//             toRoom();
//             document.getElementById("refresh").click();
//         };
//         document.getElementById("button").addEventListener('click', listener);
//         //console.log("before if");
//         //console.log(currToken);
//     }
// );
//
// function toRoom() {
//     //document.getElementById("button").removeEventListener('click', listener);
//     //document.getElementById("")
//     document.getElementById("sub").addEventListener('click', () => {
//         console.log("clicked!");
//         const room = document.getElementById("room-name").value;
//         if (room !== "") {
//             console.log("Room is not empty");
//             msocket.socket.emit("create room", room_Num => {
//                 console.log(room_Num);
//                 console.log("Created room");
//                 document.getElementById("rooms").innerHTML += "<a href = '#'><div class='room-main " + room + " " + room_Num + "> Комната " + room + " (id:" + room_Num + ")</div></a>";
//                 document.getElementById("hide-content").style.display = "none";
//                 const body = document.getElementsByTagName("body");
//                 //document.getElementById("refresh").click();
//                 for (let i = 0; i < body.length; i++) {
//                     body[i].style.overflow = "visible";
//                 }
//                 /*document.getElementById("main-field").style.display = "none";
//                 document.getElementById("lobby-room").style.display = "flex";*/
//                 document.getElementById("lobby-ready-room").addEventListener("click", function () {
//                     msocket.socket.emit("ready room", room_Num);
//                     /*document.getElementById("lobby-room").style.display = "none";
//                     document.getElementById("play-room").style.display = "flex";*/
//                     Room = room_Num;
//                 });
//             });
//
//         } else {
//             alert("You should insert a room name");
//         }
//     });
//     document.getElementById('refresh').addEventListener('click', function () {
//         msocket.socket.emit("get rooms", rooms => {
//             console.log(rooms);
//             const roomPlace = document.getElementById('rooms');
//             roomPlace.innerHTML = "";
//             console.log(roomPlace);
//             for (let i = 0; i < rooms.length; i++) {
//                 //console.log(rooms[i]);
//                 roomPlace.innerHTML += "<div class='room-main' id='" + rooms[i].toString().substring(4) + "'> Комната id:" + rooms[i].toString().substring(4) + ")</div>";
//                 document.querySelectorAll(".room-main").forEach(function (item) {
//                     item.addEventListener("click", function () {
//                         console.log("pressed the room");
//                         msocket.socket.emit('join room', item.id, roomNum => {
//                             console.log("Joined: " + roomNum);
//                             /*document.getElementById("main-field").style.display = "none";
//                             document.getElementById("lobby-room").style.display = "flex";*/
//                             document.getElementById("lobby-ready-room").addEventListener("click", function () {
//                                 msocket.socket.emit("ready room", roomNum);
//                                 /*document.getElementById("lobby-room").style.display = "none";
//                                 document.getElementById("play-room").style.display = "flex";*/
//                                 //document.getElementById("win-menu").style.display = "none";
//                                 Room = roomNum;
//                             })
//                         });
//                     })
//                 })
//                 /*document.getElementById(rooms[i].toString().substring(4)).addEventListener('click', function () {
//
//                 })*/
//             }
//             console.log(roomPlace);
//         })
//     })
// }
//
// function GameLogic() {
//     let old_end_turn = document.getElementById("end-turn");
//     let new_end_turn = old_end_turn.cloneNode(true);
//     old_end_turn.parentNode.replaceChild(new_end_turn, old_end_turn);
//
//     let old_pass = document.getElementById("pass");
//     var new_pass = old_pass.cloneNode(true);
//     old_pass.parentNode.replaceChild(new_pass, old_pass);
//
//     // console.log("Asked for some logic");
//     //document.getElementById("readyRoom").addEventListener('click', function (o, properties) {
//     // msocket.socket.emit("ready room", room_Num);
//     //console.log("ready room");
//     if (myTurn === true) {
//         document.getElementById("end-turn").addEventListener('click', function () {
//             console.log("end-turn " + Room);
//             console.log("END-TURN");
//             msocket.socket.emit("turn end", Room);
//         })
//         document.getElementById("pass").addEventListener('click', function () {
//             // console.log("pass " + Room);
//             console.log("PASS");
//             msocket.socket.emit("fight ready", Room);
//         })
//     }
//     //})
//
// }
//
// function getHands(sides, playerID) {
//     console.log(sides);
//     for (let side in sides) {
//         // console.log(sides[side]);
//         // console.log(sides[side]["playerId"]);
//         if (sides[side]["playerId"] !== playerID) {
//             //console.log("enemy!");
//             addBlankCard(sides[side]["handCards"].length);
//             document.getElementById("enemy-current-attack").innerHTML = "<div class = 'currentAttackWindow'>" + sides[side]["attackPower"] + "</div>";
//         } else {
//             //console.log("player!");
//             addPlayerCard(sides[side]["handCards"]);
//             document.getElementById("player-current-attack").innerHTML = "<div class = 'currentAttackWindow'>" + sides[side]["attackPower"] + "</div>";
//         }
//     }
// }
//
//
// function getRows(sides, playerID) {
//     for (let side in sides) {
//         let id = "player";
//         if (sides[side]["playerId"] !== playerID) {
//             id = "enemy";
//         }
//         for (let i = 0; i < sides[side]["firstLine"].length; i++) {
//             let classes = "card " + sides[side]["firstLine"][i]["id"] + " " + sides[side]["firstLine"][i]["typeLine"];
//             if (sides[side]["firstLine"][i]["isEffectActive"]) {
//                 classes += "isEffectActive";
//             }
//             document.getElementById(id + "-first").innerHTML += "<div class='" + classes + "'><span class = 'card-value' >" + sides[side]["firstLine"][i]["value"] + "</span> <span class='card-name'>" + sides[side]["firstLine"][i]["name"] + "</span> </div>";
//         }
//         for (let i = 0; i < sides[side]["secondLine"].length; i++) {
//             let classes = "card " + sides[side]["secondLine"][i]["id"] + " " + sides[side]["secondLine"][i]["typeLine"];
//             if (sides[side]["secondLine"][i]["isEffectActive"]) {
//                 classes += "isEffectActive";
//             }
//             document.getElementById(id + "-second").innerHTML += "<div class='" + classes + "'><span class = 'card-value' >" + sides[side]["secondLine"][i]["value"] + "</span> <span class='card-name'>" + sides[side]["secondLine"][i]["name"] + "</span> </div>";
//         }
//         for (let i = 0; i < sides[side]["thirdLine"].length; i++) {
//             let classes = "card " + sides[side]["thirdLine"][i]["id"] + " " + sides[side]["thirdLine"][i]["typeLine"];
//             if (sides[side]["thirdLine"][i]["isEffectActive"]) {
//                 classes += "isEffectActive";
//             }
//             //console.log(handCards[i]);
//             document.getElementById(id + "-third").innerHTML += "<div class='" + classes + "'><span class = 'card-value' >" + sides[side]["thirdLine"][i]["value"] + "</span> <span class='card-name'>" + sides[side]["thirdLine"][i]["name"] + "</span> </div>";
//         }
//     }
// }
//
// function addBlankCard(cardAmount) {
//     //console.log("added blank cards");
//     for (let i = 0; i < cardAmount; i++) {
//         document.getElementById("enemy-Card-Place").innerHTML += "<div class='blank-card'></div>"
//     }
// }
//
// function addPlayerCard(handCards) {
//     //console.log("added player's cards");
//     for (let i = 0; i < handCards.length; i++) {
//         let classes = "card hand " + handCards[i]["id"] + " " + handCards[i]["typeLine"];
//         if (handCards[i]["isEffectActive"]) {
//             classes += "isEffectActive";
//         }
//         //console.log(handCards[i]);
//         const gen = Math.ceil((Math.random() * 1000000));
//         document.getElementById('CardPlace').innerHTML += "<div class = '" + classes + "' id='" + gen + "'><span class = 'card-value' >" + handCards[i]["value"] + "</span> <span class='card-name'>" + handCards[i]["name"] + "</span></div>";
//         /*document.getElementById(gen).addEventListener('click', function(){
//             msocket.putCard(gen);
//         })*/
//     }
//     console.log(myTurn);
//     if (myTurn === true) {
//         document.querySelectorAll('.hand').forEach(function (item) {
//             item.addEventListener('click', function () {
//                 putCard(item.id);
//             })
//         })
//     }
// }
//
// function putCard(id) {
//     console.log("Clicked card:" + id);
//     const card = document.getElementById(id);
//     /*let cardPlace = "player-"+card.classList[2];
//     console.log(cardPlace);
//     document.getElementById(cardPlace).innerHTML += card.outerHTML;
//     document.getElementById("CardPlace").removeChild(card);*/
//     console.log(Room, card.classList[1], card.classList[2]);
//     msocket.socket.emit("put card", Room, card.classList[2], card.classList[3]);
//
// }
//
//
// export default msocket;
//
//
// /*console.log(token);
// socket.emit("init user", token);
// socket.on("user ready", () => {
//     document.getElementById("sub").addEventListener('click', () => {
//         console.log("clicked!");
//         const room = document.getElementById("room-name").value;
//         if (room !== "") {
//             console.log("Room is not empty");
//             socket.emit("create room", room_Num => {
//                 console.log(room_Num);
//                 console.log("Created room");
//                 document.getElementById("rooms").innerHTML += "<a href = '#'><div class='room-main " + room + " " + room_Num + "> Комната " + room + " (id:" + room_Num + ")</div></a>";
//                 document.getElementById("hide-content").style.display = "none";
//                 const body = document.getElementsByTagName("body");
//                 //document.getElementById("refresh").click();
//                 for (let i = 0; i < body.length; i++) {
//                     body[i].style.overflow = "visible";
//                 }
//                 document.getElementById("root").innerHTML = <Room></Room>;
//             });
//
//         } else {
//             alert("You should insert a room name");
//         }
//     });
//     document.getElementById('refresh').addEventListener('click', function () {
//         socket.emit("get rooms", rooms => {
//             console.log(rooms);
//             const roomPlace = document.getElementById('rooms');
//             roomPlace.innerHTML = "";
//             console.log(roomPlace);
//             for (let i = 0; i < rooms.length; i++) {
//                 console.log(rooms[i]);
//                 roomPlace.innerHTML += "<div class='room-main' id='" + rooms[i].toString().substring(4) + "'> Комната id:" + rooms[i].toString().substring(4) + ")</div>";
//                 document.getElementById(rooms[i].toString().substring(4)).addEventListener('click', function () {
//                     console.log("pressed the room");
//                     socket.emit('join room', rooms[i].toString().substring(4));
//                 })
//             }
//             console.log(roomPlace);
//         })
//     })
//     socket.on('board update', board => {
//         console.log(board);
//     });
// });
// })*/
