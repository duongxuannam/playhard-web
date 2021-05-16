import { useState, useEffect, useCallback,useRef, useContext } from 'react';
import get from 'lodash/get';
import {VideoContext} from './index'
import SocketService from '../services/socketService';
import {openCamera} from './helpers'

const peerConnections = {};
const configuration = { iceServers: [{ url: 'stun:stun.l.google.com:19302' }] };

export const useVideoCall = () => {
  const [localStream, setLocalStream] = useState();
  const [remoteStreams, setRemoteStreams] = useState({});
  const [room, setRoom] = useState();

  const roomId = '2000'
  const name = 'front-end-web'

  const onGetRoomsCallBack = roomParam => {
    setRoom(roomParam);
  };

  const onLeaveRoomCallBack = useCallback(idUserLeave => {
    setRoom(preRoom => {
      const users = get(preRoom, ['users'], {});
      const user = users[idUserLeave];
      if (user) {
        delete users[idUserLeave];
      }
      const newRoom = {
        ...preRoom,
        users,
      };
      setRoom(newRoom);
    });
    Object.keys(peerConnections).forEach(function (key) {
      peerConnections[key] && peerConnections[key].close();
      peerConnections[key] && delete peerConnections[key];
    });
    setRemoteStreams({});
  }, []);

  const onJoinRoomCallBack = useCallback(
    async (idUserJoin, roomParam) => {
      setRoom(roomParam);
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnections[idUserJoin] = peerConnection;

      // peerConnections[idUserJoin].addStream(localStream);


      localStream && localStream.getTracks().forEach(function(track) {
        peerConnections[idUserJoin].addTrack(track, localStream);
      });
    


      peerConnections[idUserJoin].onicecandidate = event => {
        try {
          if (event.candidate) {
            SocketService.candidateRoomVideo(event.candidate.toJSON(), idUserJoin);
          }
        } catch (e) {
          console.error(`Error adding iceCandidate: ${e}`);
        }
      };

      const offer = await peerConnections[idUserJoin].createOffer();
      await peerConnections[idUserJoin].setLocalDescription(new RTCSessionDescription(offer));
      SocketService.offerRoomVideo(peerConnections[idUserJoin]?.localDescription, idUserJoin);
    },
    [localStream]
  );

  const onCandidateRoomVideoCallBack = (idSender, candidate) => {
    peerConnections[idSender].addIceCandidate(new RTCIceCandidate(candidate));
  };

  const onOfferRoomCallBack = useCallback(
    async (idSender, description) => {
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnections[idSender] = peerConnection;
      // peerConnections[idSender].addStream(localStream);
      localStream &&  localStream.getTracks().forEach(function(track) {
        peerConnections[idSender].addTrack(track, localStream);
      });
    
      peerConnections[idSender].onicecandidate = event => {
        if (event.candidate) {
          SocketService.candidateRoomVideo(event.candidate.toJSON(), idSender);
        }
      };
      peerConnections[idSender].onaddstream = e => {
        console.log('co the nao m chay ko vay chang trai')
        if (e.stream && peerConnections[idSender] !== e.stream) {
          const newStream = e.stream;
          setRemoteStreams(preStream => {
            const newRemoteStreams = { ...preStream, [idSender]: newStream };
            return newRemoteStreams;
          });
        }
      };
      await peerConnections[idSender].setRemoteDescription(new RTCSessionDescription(description));
      const answer = await peerConnections[idSender].createAnswer();
      await peerConnections[idSender].setLocalDescription(new RTCSessionDescription(answer));
      SocketService.answerRoomVideo(peerConnections[idSender].localDescription, idSender);
    },
    [localStream]
  );

  const onAnswerRoomVideoCallBack = (idSender, description) => {
    peerConnections[idSender].onaddstream = e => {
      if (e.stream && peerConnections[idSender] !== e.stream) {
        const newStream = e.stream;
        setRemoteStreams(preStream => {
          const newRemoteStreams = { ...preStream, [idSender]: newStream };
          return newRemoteStreams;
        });
      }
    };
    peerConnections[idSender].setRemoteDescription(new RTCSessionDescription(description));
  };

  const exitRoom = useCallback(() => {
    Object.keys(peerConnections).forEach(function (key) {
      peerConnections[key] && peerConnections[key].close();
      peerConnections[key] && delete peerConnections[key];
    });
    setLocalStream(null);
    setRemoteStreams({});
  }, []);

  useEffect(() => {
    SocketService.connectSocket();

    // setup room
    SocketService.joinRoom(roomId, roomId, name);
    SocketService.getRoom(roomId);
    SocketService.onGetRoom(onGetRoomsCallBack);
    SocketService.onLeaveRoom(onLeaveRoomCallBack);

    // //setup stream
    SocketService.onCandidateRoomVideo(onCandidateRoomVideoCallBack);
    SocketService.onAnswerRoomVideo(onAnswerRoomVideoCallBack);
    return () => {
      SocketService.leaveRoom(roomId);
      SocketService.disConnectSocket();
      exitRoom();
    };
  }, [roomId, name, exitRoom, onLeaveRoomCallBack]);

  useEffect(() => {
    //setup stream
    SocketService.onJoinRoom(onJoinRoomCallBack);
    SocketService.onOfferRoomVideo(onOfferRoomCallBack);
  }, [onJoinRoomCallBack, onOfferRoomCallBack]);

  useEffect(() => {
    const turnOnCamera = async () => {
      const newStream = await openCamera();
      setLocalStream(newStream);
    };
    turnOnCamera();
  }, []);

  const customerStreams = [];

  for (var remoteStream in remoteStreams) {
    if (remoteStreams.hasOwnProperty(remoteStream)) {
      customerStreams.push(remoteStreams[remoteStream]);
    }
  }

  return {
    localStream,
    remoteStreams,
    room,
    customerStreams,
  };
};


export const useCurrentVideo = () => {
    const videoCurrentRef = useRef(null)
    const videoCustomerRef = useRef(null)

    const {localStream,remoteStreams} = useContext(VideoContext)

    useEffect(() => {
     if (videoCurrentRef?.current) {
        videoCurrentRef.current.srcObject = localStream
    }
        return () => {
            // cleanup
        }
    }, [localStream])
    
    useEffect(() => {
     if (videoCustomerRef?.current) {
      const customerStreams = [];

      for (var remoteStream in remoteStreams) {
        if (remoteStreams.hasOwnProperty(remoteStream)) {
          customerStreams.push(remoteStreams[remoteStream]);
        }
      } 
        videoCustomerRef.current.srcObject = customerStreams[0]
    }

        return () => {
            // cleanup
        }
    }, [remoteStreams])
    return {videoCurrentRef, videoCustomerRef}
}