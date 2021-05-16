import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook } from '@fortawesome/free-solid-svg-icons'

import '../style.css'

export default function ChatBox() {
    return (
        <div className="main__right">
        <div className="main__chat_window">
            <div className="messages">
  
            </div>
        </div>
        <div className="main__message_container">
          <input id="chat_message" type="text" autocomplete="off" placeholder="Type message here..."/>
          <div id="send" className="options__button">
            <FontAwesomeIcon icon={faBook} />
          </div>
        </div>
      </div>
    )
}