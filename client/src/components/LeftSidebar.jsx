import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp, Sun, Moon } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);
  const { likeNotification } = useSelector(store => store.realTimeNotification);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  // Dark mode state with localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || false
  })

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', isDarkMode)
  }, [isDarkMode])

  const logoutHandler = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/v1/user/logout', { withCredentials: true });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  const sidebarHandler = (textType) => {
    if (textType === 'Logout') {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
      // } else if (textType === 'Messages') {
      //   navigate("/chat");
    }
  }

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    // { icon: <Search />, text: "Search" },
    // { icon: <TrendingUp />, text: "Explore" },
    // { icon: <MessageCircle />, text: "Messages" },
    // { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className='w-6 h-6'>
          <AvatarImage src={user?.profilePicture} alt="profile_img" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile"
    },
    { icon: <LogOut />, text: "Logout" },
  ]
  return (
    <div className="fixed top-0 left-0 z-20 w-[16%] h-screen bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg rounded-r-2xl border-r border-gray-200 dark:border-gray-700 px-6 py-8 flex flex-col">
      <h1 className="text-2xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-10 select-none">
        <span className="text-blue-600 dark:text-blue-400">MOMENT</span>RA
      </h1>
      {/* <div>
        {
          sidebarItems.map((item, index) => {
            return (
              <div onClick={() => sidebarHandler(item.text)} key={index} className='flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3'>
                {item.icon}
                <span>{item.text}</span>
                {
                  item.text === "Notifications" && likeNotification.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size='icon' className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6">{likeNotification.length}</Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div>
                          {
                            likeNotification.length === 0 ? (<p>No new notification</p>) : (
                              likeNotification.map((notification) => {
                                return (
                                  <div key={notification.userId} className='flex items-center gap-2 my-2'>
                                    <Avatar>
                                      <AvatarImage src={notification.userDetails?.profilePicture} />
                                      <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <p className='text-sm'><span className='font-bold'>{notification.userDetails?.username}</span> liked your post</p>
                                  </div>
                                )
                              })
                            )
                          }
                        </div>
                      </PopoverContent>
                    </Popover>
                  )
                }
              </div>
            )
          })
        }
      </div> */}

      <nav className="flex flex-col gap-5 flex-grow">
        {sidebarItems.map(({ icon, text }, index) => (
          <button
            key={index}
            onClick={() => sidebarHandler(text)}
            className="flex items-center gap-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 px-4 py-3 rounded-lg transition duration-200 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={text}
            type="button"
          >
            <div className="text-xl">{icon}</div>
            <span>{text}</span>
          </button>
        ))}
      </nav>

      {/* Dark mode toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="mt-6 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-3 rounded-lg transition duration-200 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Toggle Dark Mode"
        type="button"
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
      </button>

      <div className="text-center text-sm text-gray-400 dark:text-gray-500 mt-auto select-none">
        © 2025 MOMENTRA
      </div>

      <CreatePost open={open} setOpen={setOpen} />

    </div>
  )
}

export default LeftSidebar