import React, { createContext } from 'react'
import Header from './components/Header'
import CurrentVideo from './components/CurrentVideo'
import VideoBox from './components/VideoBox'
import { useVideoCall } from './hooks'
import './style.css'

export const VideoContext = createContext({});

export default function VideoCall() {
    const {
        localStream,
        remoteStreams,
        room,
        customerStreams,
    } = useVideoCall()
    console.log('room',room)
    return (
        <VideoContext.Provider
            value={{localStream, remoteStreams, room, customerStreams}}
        >
            <Header />
            <div className="main">
                <VideoBox />
                <CurrentVideo />
            </div>
        </VideoContext.Provider>
    )
}