import React from 'react'
import { useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const ChatPage = () => {
  const {user, suggestedUsers} = useSelector(store=>store.auth);
  return (
    <div className='flex ml-[16%] h-screen'>
      <section>
        <h1 className='font-bold mb-4 px-3 text-xl'>{user?.username}</h1>
        <hr className='m-4 border-gray-300'/>
        <div className='overflow-y-auto h-[80vh]'>
          {
            suggestedUsers.map((suggestedUser) => {
              return (
                <div className='flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer'>
                  <Avatar>
                    <AvatarImage src={suggestedUser?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='font-medium'>{suggestedUser?.username}</span>
                  </div>
                </div>
              )
            })
          }
        </div>
      </section>
    </div>
  )
}

export default ChatPage