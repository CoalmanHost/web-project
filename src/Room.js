import React from 'react';
import "Room.css";

const Room = () => {
 return(
     <div className={"container"}>
        <div className={"enemy"}>
            <div className={"current-cards"}></div>
            <div className={"health"}></div>
            <div className={"others"}></div>
            <div className={"played"}></div>
        </div>
         <div className={"center"}></div>
         <div className={"me"}>
             <div className={"current-cards"}></div>
             <div className={"health"}></div>
             <div className={"others"}></div>
             <div className={"played"}></div>
         </div>
     </div>
 )
}
 export default Room