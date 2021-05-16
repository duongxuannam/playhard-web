import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideo,faVolumeUp } from '@fortawesome/free-solid-svg-icons'

import '../style.css'
export default function VideoBox() {
    return (
        <div className="main__left">
        <div className="videos__group">
          <div id="video-grid">
  
          </div>
        </div>
        <div className="options">
          <div className="options__left">
            <div id="stopVideo" className="options__button">
              <FontAwesomeIcon icon={faVideo} />
            </div>
            <div id="muteButton" className="options__button">
            <FontAwesomeIcon icon={faVolumeUp} />
            </div>
            <div id="showChat" className="options__button">
              <i className="fa fa-comment"></i>
            </div>
          </div>
          <div className="options__right">
            <div id="inviteButton" className="options__button">
              <i className="fas fa-user-plus"></i>
            </div>
          </div>
        </div>
      </div>
    )
}