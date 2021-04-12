import React from 'react';
import './MainField.css';
import './newRoom';

const Main = () => {
    return (
        <div className="container">
            <div className="name">
                <h1>Игровые комнаты</h1>
                <p>Для начала игры выберите игровую комнату или создайте свою!</p>
                <button className='new-room' id='newRoom'>
                    + Создать игровую комнату
                </button>
            </div>
            <div className="rooms" id="rooms">

            </div>
            <div className="footer">
                <h3>Контактная информация</h3>
                <p>Telegram</p>
                <p>Email</p>
                <p>VK</p>
            </div>
        </div>
    )
}
export default Main;