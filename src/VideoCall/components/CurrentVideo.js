import React from 'react'
import { useCurrentVideo } from '../hooks'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0.3;
  background-color: #242f41;
`

const VideoBox = styled.video`
    height:200px;
    width:200px;
    background-color:rebeccapurple;
`

export default function CurrentVideo1() {
    const { videoCurrentRef } = useCurrentVideo()
    return (
        <Container>
            <VideoBox
                ref={videoCurrentRef}
                playsInline autoPlay muted />
        </Container>
    )
}