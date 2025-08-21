import React, { useMemo } from "react";
import { io } from "socket.io-client";
import API_URL from "../constants";

const SocketContext = React.createContext(null);

export const useSocket = () => {
  return React.useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => io(API_URL), []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
