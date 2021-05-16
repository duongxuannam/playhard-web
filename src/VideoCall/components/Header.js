import React from 'react'
import '../style.css'

export default function Header() {
    return (
        <div className="header">
        <div className="logo">
          <div className="header__back">
            <i className="fas fa-angle-left"></i>
          </div>
          <h3>Video Chat</h3>
        </div>
      </div>  
        )
}