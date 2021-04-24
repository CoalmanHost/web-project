import React from 'react';
import "./Room.css";

function addCard(){
    document.getElementById("CardPlace").innerHTML += "<div class='card' id='card'></div>"
}

document.getElementById("card").addEventListener("click", function (){
    document.getElementById( "card").onmousedown = moveCard;
})

function moveCard(){
    const el = document.getElementById("card");
    el.style.left = el.offsetLeft + "px";
}


const Room = () => {
 return(
     <div className={"container"}>
        <div className={"icons"}>
            <div className={"icon"}></div>
            <div className={"effects"}></div>
            <div className={"icon"}></div>
        </div>
         <div className={"field"}>
             <div className={"rows"}>
                 <div className={"myCards"}>

                 </div>
                 <div className={"bombardier game-section"}>

                 </div>
                 <div className={"interceptor game-section"}>

                 </div>
                 <div className={"cruiser game-section"}>

                 </div>
             </div>
             <div className={"rows"}>
                 <div className={"cruiser game-section"}>

                 </div>
                 <div className={"interceptor game-section"}>

                 </div>
                 <div className={"bombardier game-section"}>

                 </div>
                 <div className={"myCards"} id={"CardPlace" }>

                 </div>
             </div>

         </div>
         <div className={"packages"}>
             <div className={"package"}></div>
             <div className={"package"} onClick={addCard} ></div>
         </div>
     </div>
 )
}
 export default Room