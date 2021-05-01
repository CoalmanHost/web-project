import React from 'react';
import "./Room.css";


function move_To(id){

}

function addCard() {
    const generated = Math.ceil(Math.random() * 1000000);
    const classGenerator = Math.ceil(Math.random() * 3);
    document.getElementById("CardPlace").innerHTML += "<div class='card " + classGenerator + "' id ='" + generated + "'>" + Math.ceil(Math.random() * 10) + "</div>"
    document.getElementById(generated).addEventListener('click', function (){
        const card = document.getElementById(generated);
        const classNum = card.classList;
        let addCardTo;
        if ("3" === classNum[1]){
            addCardTo = document.getElementById("bombardier");
        }
        if ("2" === classNum[1]){
            addCardTo = document.getElementById("interceptor");
        }
        if ("1" === classNum[1]){
            addCardTo = document.getElementById("cruiser");
        }
        addCardTo.innerHTML += card.outerHTML;
        document.getElementById("CardPlace").removeChild(card);
    })
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
                 <div className={"game-section"} id={"cruiser"}>

                 </div>
                 <div className={"game-section"} id={"interceptor"}>

                 </div>
                 <div className={"game-section"} id={"bombardier"}>

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