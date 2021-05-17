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

  const roomId = '100'
  const name = 'front-end-web'

  const onGetRoomsCallBack = roomParam => {
    setRoom(roomParam);
  };

  const onLeaveRoomCallBack = useCallback(idUserLeave => {
    console.log('co chay meo dau')
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
      if(key === idUserLeave){
        peerConnections[key] && peerConnections[key].close();
        peerConnections[key] && delete peerConnections[key];
      }
    });
    setRemoteStreams(preRemoteStream => {
      const tempData = preRemoteStream
      const stream = tempData[idUserLeave];
      if (stream) {
        delete tempData[idUserLeave];
      }
      setRemoteStreams(tempData)
    });
  }, []);

  const onJoinRoomCallBack = useCallback(
    async (idUserJoin, roomParam) => {
      console.log('thằng host chay 1')
      setRoom(roomParam);
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnections[idUserJoin] = peerConnection;
      console.log('thằng host chay 2')

      localStream && localStream.getTracks().forEach(function(track) {
        console.log('thằng host chay 3')

        peerConnections[idUserJoin].addTrack(track, localStream);
        console.log('thằng host chay 33')

      });
    

      console.log('thằng host chay 4')

      peerConnections[idUserJoin].onicecandidate = event => {
        try {
          if (event.candidate) {
            console.log('thằng host chay ?')
            SocketService.candidateRoomVideo(event.candidate.toJSON(), idUserJoin);
          }
        } catch (e) {
          console.error(`Error adding iceCandidate: ${e}`);
        }
      };
      console.log('thằng host chay 5')
      const offer = await peerConnections[idUserJoin].createOffer();
      await peerConnections[idUserJoin].setLocalDescription(new RTCSessionDescription(offer));
      console.log('thằng host chay 6')

      SocketService.offerRoomVideo(peerConnections[idUserJoin]?.localDescription, idUserJoin);
      console.log('thằng host chay 7',peerConnections[idUserJoin])

    },
    [localStream]
  );

  const onCandidateRoomVideoCallBack = (idSender, candidate) => {
    console.log('2 thang chay chung 1 ',peerConnections[idSender])
    console.log('2 thang chay chung 1 ',candidate)

    peerConnections[idSender].addIceCandidate(new RTCIceCandidate(candidate));
  };

  const onOfferRoomCallBack = useCallback(
    async (idSender, description) => {
      console.log('thawng join chay ',1)
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnections[idSender] = peerConnection;
      // peerConnections[idSender].addStream(localStream);
      console.log('thawng join chay ',2)

      localStream &&  localStream.getTracks().forEach(function(track) {
        console.log('thawng join chay 3')

        peerConnections[idSender].addTrack(track, localStream);
      });
    
      peerConnections[idSender].onicecandidate = event => {
        console.log('thawng join chay 4')

        if (event.candidate) {
          SocketService.candidateRoomVideo(event.candidate.toJSON(), idSender);
        }
      };
      console.log('thawng join chay 5')

      peerConnections[idSender].onaddstream = e => {
        console.log('thawng join chay 6')
        if (e.stream && peerConnections[idSender] !== e.stream) {
          const newStream = e.stream;
          setRemoteStreams(preStream => {
            const newRemoteStreams = { ...preStream, [idSender]: newStream };
            return newRemoteStreams;
          });
        }
      };
      console.log('thawng join chay 7')

      await peerConnections[idSender].setRemoteDescription(new RTCSessionDescription(description));
      const answer = await peerConnections[idSender].createAnswer();
      await peerConnections[idSender].setLocalDescription(new RTCSessionDescription(answer));
      console.log('thawng join chay 8',new RTCSessionDescription(answer))

      SocketService.answerRoomVideo(peerConnections[idSender].localDescription, idSender);
    },
    [localStream]
  );

  const onAnswerRoomVideoCallBack = async (idSender, description) => {
    console.log('thang host 2 chay 1 ')
    peerConnections[idSender].onaddstream = e => {
      console.log('thang host 2 chay ?')

      if (e.stream && peerConnections[idSender] !== e.stream) {
        console.log('thang host 2 chay ?? ')

        const newStream = e.stream;
        setRemoteStreams(preStream => {
          const newRemoteStreams = { ...preStream, [idSender]: newStream };
          return newRemoteStreams;
        });
      }
    };
    console.log('thang host 2 chay 2 ',(description))


    await peerConnections[idSender].setRemoteDescription(description);
    console.log('thang host 2 chay 3 ')

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
    const videoCustomer2Ref = useRef(null)
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
      console.log('why not',remoteStreams)
      for (var remoteStream in remoteStreams) {
        if (remoteStreams.hasOwnProperty(remoteStream)) {
          customerStreams.push(remoteStreams[remoteStream]);
        }
      } 
        if(customerStreams[0]){
          videoCustomerRef.current.srcObject = customerStreams[0]
        }
        if(customerStreams[1]){
          videoCustomer2Ref.current.srcObject = customerStreams[1]
        }

    }

        return () => {
            // cleanup
        }
    }, [remoteStreams])
    return {videoCurrentRef, videoCustomerRef,videoCustomer2Ref}
}