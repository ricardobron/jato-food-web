import { API_BASE_URL } from '@/constants';
import { useSession } from 'next-auth/react';
import {
  ReactNode,
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react';

import socketClientIo, { Socket } from 'socket.io-client';

interface ServerToClientEvents {
  [x: string]: (data: any) => void;
}

interface ClientToServerEvents {
  [x: string]: (data: any) => void;
}

type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextType {
  socket: SocketClient | null;
}

export const SocketContext = createContext<SocketContextType>(
  {} as SocketContextType
);

export const SocketContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [socket, setSocket] = useState<SocketClient | null>(null);

  const session = useSession();

  const jwt = session.data?.jwt;

  useEffect(() => {
    Notification.requestPermission();
  }, []);

  useEffect(() => {
    if (jwt) {
      const newSocket = socketClientIo(API_BASE_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        query: {
          token: jwt,
        },
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [jwt]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);

  return context;
}
