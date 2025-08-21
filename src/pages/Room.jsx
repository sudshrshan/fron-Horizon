import React, { useEffect, useCallback, useState } from 'react';
import { useSocket } from '../providers/Socket';
import { usePeer } from "../providers/Peer";
import { useNavigate } from 'react-router-dom';
import './Room.css';

const Room = () => {
  const { socket } = useSocket();
  const { peer, createOffer, createAnswer, setRemoteans, sendStream, remoteStream } = usePeer();
  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState(null);

  const navigate = useNavigate();

  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("📷 Got local stream");
      setMyStream(stream);
      sendStream(stream);
    } catch (error) {
      console.error("🎤 Error accessing media devices", error);
    }
  }, [sendStream]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  const handleNewUserJoined = useCallback(async ({ emailId }) => {
    console.log("👤 New user joined:", emailId);
    setRemoteEmailId(emailId);
    const offer = await createOffer();
    socket.emit("call-user", { emailId, offer });
  }, [createOffer, socket]);

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    console.log("📲 Incoming call from:", from);
    setRemoteEmailId(from);
    const answer = await createAnswer(offer);
    socket.emit("call-accepted", { emailId: from, ans: answer });
  }, [createAnswer, socket]);

  const handleCallAccepted = useCallback(async ({ ans }) => {
    console.log("✅ Call accepted");
    await setRemoteans(ans);
  }, [setRemoteans]);

  // ICE candidate logic
  useEffect(() => {
    peer.onicecandidate = (e) => {
      if (e.candidate && remoteEmailId) {
        console.log("❄️ Sending ICE candidate");
        socket.emit("ice-candidate", { to: remoteEmailId, candidate: e.candidate });
      }
    };
  }, [peer, socket, remoteEmailId]);

  useEffect(() => {
    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("❄️ Received and added ICE candidate");
      } catch (err) {
        console.error("⚠️ Error adding ICE", err);
      }
    });
  }, [socket, peer]);

  // Socket events
  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incomming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incomming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handleNewUserJoined, handleIncomingCall, handleCallAccepted]);

  const endCall = () => {
    myStream?.getTracks().forEach(track => track.stop());
    if (peer) peer.close();

    if (remoteEmailId) {
      socket.emit("user-left", { emailId: remoteEmailId });
    }

    setMyStream(null);
    setRemoteEmailId(null);
    navigate('/');
  };

  return (
    <div className="room-container">
      <h2 className="room-title">📞 In Call with: {remoteEmailId || "Waiting..."}</h2>

      <div className="video-section">
        {myStream && (
          <div className="video-wrapper">
            <video
              playsInline
              autoPlay
              ref={(video) => {
                if (video) video.srcObject = myStream;
              }}
              className="video-player local-video"
            />
            <p className="video-label">You</p>
          </div>
        )}

        {remoteStream && (
          <div className="video-wrapper">
            <video
              playsInline
              autoPlay
              ref={(video) => {
                if (video) video.srcObject = remoteStream;
              }}
              className="video-player remote-video"
            />
            <p className="video-label">Remote</p>
          </div>
        )}
      </div>

      <button className="end-call-btn" onClick={endCall}>End Call</button>
    </div>
  );
};

export default Room;
