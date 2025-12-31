import { io } from 'socket.io-client';

let socket = null;

export function initSocket(userId) {
  if (!socket) {
    socket = io('http://localhost:8000', {
      transports: ['websocket'],
      query: { userId },
      withCredentials: true, // enable if your backend uses cookie auth
    });
  }
  return socket;
}

export function getSocket() {
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
