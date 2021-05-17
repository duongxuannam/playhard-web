import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook } from '@fortawesome/free-solid-svg-icons'
import styled from 'styled-components'
import '../style.css'
import { useCurrentVideo } from '../hooks'

const VideoBox = styled.video`
    height:200px;
    width:200px;
    background-color:red;
`

export default function ChatBox() {
  const { videoCustomerRef } = useCurrentVideo()
    return (
        <div className="main__right">
        <div className="main__chat_window">
            <div className="messages">
            <VideoBox
                ref={videoCustomerRef}
                playsInline autoPlay muted />
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