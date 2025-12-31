import { useEffect } from 'react';
import ChatPage from './components/ChatPage';
import EditProfile from './components/EditProfile';
import Home from './components/Home';
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import Profile from './components/Profile';
import Signup from './components/Signup';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setOnlineUsers } from './redux/chatSlice';
import { setLikeNotification } from './redux/rtnSlice';
import ProtectedRoutes from './components/ProtectedRoutes';
import { initSocket, getSocket, closeSocket } from './lib/socket';

const browserRouter = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      { path: '/', element: <ProtectedRoutes><Home /></ProtectedRoutes> },
      { path: '/profile/:id', element: <ProtectedRoutes><Profile /></ProtectedRoutes> },
      { path: '/account/edit', element: <ProtectedRoutes><EditProfile /></ProtectedRoutes> },
      { path: '/chat', element: <ProtectedRoutes><ChatPage /></ProtectedRoutes> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
]);

function App() {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // When logged in, create socket and wire listeners.
    if (user?._id) {
      const s = initSocket(user._id);

      const handleOnline = (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers)); // serializable
      };
      const handleNotification = (notification) => {
        dispatch(setLikeNotification(notification)); // serializable
      };

      s.off('getOnlineUsers', handleOnline); // avoid duplicate handlers on hot reload
      s.off('notification', handleNotification);
      s.on('getOnlineUsers', handleOnline);
      s.on('notification', handleNotification);

      return () => {
        // Remove listeners but keep socket alive while user stays logged in.
        s.off('getOnlineUsers', handleOnline);
        s.off('notification', handleNotification);
      };
    }

    // When logged out, close and clear the socket.
    closeSocket();
  }, [user?._id, dispatch]);

  return <RouterProvider router={browserRouter} />;
}

export default App;
