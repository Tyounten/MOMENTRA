import { io } from 'socket.io-client';

let socket = null;

export function initSocket(userId) {
  if (!socket) {
    socket = io('https://momentra-6dzv.onrender.com', {
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
