
import React, { useMemo, useEffect, useState, useCallback } from "react";

const PeerContext = React.createContext(null);
export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = ({ children }) => {
  const [remoteStream, setRemoteStream] = useState(null);

  const peer = useMemo(() => new RTCPeerConnection({
    iceServers: [
      { urls: ["stun:stun.l.google.com:19302"] }
    ]
  }), []);

  const sendStream = useCallback((stream) => {
    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });
  }, [peer]);

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (offer) => {
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  };

  const setRemoteans = async (ans) => {
    await peer.setRemoteDescription(new RTCSessionDescription(ans));
  };

  useEffect(() => {
    const stream = new MediaStream();
    const handleTrackEvent = (e) => {
      console.log("📡 Received track:", e.track.kind);
      stream.addTrack(e.track);
      setRemoteStream(stream);
    };

    peer.addEventListener("track", handleTrackEvent);
    return () => {
      peer.removeEventListener("track", handleTrackEvent);
    };
  }, [peer]);

  return (
    <PeerContext.Provider value={{ peer, createOffer, createAnswer, setRemoteans, sendStream, remoteStream }}>
      {children}
    </PeerContext.Provider>
  );
};
