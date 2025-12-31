import React, { useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'
import { Link } from 'react-router-dom'
import { setAuthUser } from '@/redux/authSlice';

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const dispatch = useDispatch();

  // ---------- FOLLOW / UNFOLLOW STATE ----------
  const authorId = post?.author?._id?.toString();
  const meId = user?._id?.toString();

  // local loading state for the follow button
  const [followLoading, setFollowLoading] = useState(false);

  const isFollowing = useMemo(() => {
    if (!meId || !authorId || meId === authorId) return false;
    return user?.following?.some(f => f?.toString() === authorId);
  }, [meId, authorId, user?.following]);

  const handleToggleFollow = async () => {
    if (!authorId || !meId || meId === authorId || followLoading) return;

    setFollowLoading(true);

    // capture current list for optimistic update and possible rollback
    const prevFollowing = user?.following || [];
    const wasFollowing = prevFollowing.some(f => f?.toString() === authorId);

    // optimistic update
    const optimisticFollowing = wasFollowing
      ? prevFollowing.filter(f => f?.toString() !== authorId)
      : [...prevFollowing, authorId];

    dispatch(setAuthUser({ ...user, following: optimisticFollowing }));

    try {
      const { data } = await axios.post(
        `http://localhost:8000/api/v1/user/followorunfollow/${authorId}`,
        {},
        { withCredentials: true }
      );

      if (!(data?.success && (data.type === 'followed' || data.type === 'unfollowed'))) {
        throw new Error('Unexpected server response');
      }

      // align with server intent using the original baseline
      const serverFollowing =
        data.type === 'followed'
          ? Array.from(new Set([...prevFollowing, authorId]))
          : prevFollowing.filter(f => f?.toString() !== authorId);

      dispatch(setAuthUser({ ...user, following: serverFollowing }));
      toast.success(
        data.type === 'followed'
          ? `You are now following ${post?.author?.username}`
          : `Unfollowed ${post?.author?.username}`
      );
    } catch (err) {
      // rollback to the exact previous list
      dispatch(setAuthUser({ ...user, following: prevFollowing }));
      toast.error(err?.response?.data?.message || 'Follow action failed');
    } finally {
      setFollowLoading(false);
    }
  };
  // ---------- END FOLLOW / UNFOLLOW STATE ----------


  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  }

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? 'dislike' : 'like';
      const res = await axios.get(`http://localhost:8000/api/v1/post/${post._id}/${action}`, { withCredentials: true });
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        const updatedPostData = posts.map(p =>
          p._id === post._id ? {
            ...p,
            likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
          } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const commentHandler = async () => {
    try {
      const res = await axios.post(`http://localhost:8000/api/v1/post/${post._id}/comment`, { text }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map(p =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        );

        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(`http://localhost:8000/api/v1/post/delete/${post?._id}`, { withCredentials: true })
      if (res.data.success) {
        const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.messsage || 'Failed to delete post');
    }
  }

  const bookmarkHandler = async () => {
    try {
      const res = await axios.post(`http://localhost:8000/api/v1/post/${post?._id}/bookmark`, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const showFollowControls = meId && authorId && meId !== authorId;

  return (
    <div className='my-8 w-full max-w-sm mx-auto'>
      <div className='flex items-center justify-between'>
        <Link to={`/profile/${post.author?._id}`}>
          <div className='flex items-center gap-2'>
            <Avatar>
              <AvatarImage src={post.author?.profilePicture} alt="post_image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className='flex items-center gap-3'>
              <h1>{post.author?.username}</h1>
              {user?._id === post.author._id && <Badge variant="secondary">Author</Badge>}
            </div>
          </div>
        </Link>

        {/* Header follow/unfollow button */}
        {showFollowControls && (
          <Button
            onClick={handleToggleFollow}
            disabled={followLoading}
            className={isFollowing
              ? 'h-8 bg-gray-200 hover:bg-gray-300 text-black'
              : 'h-8 bg-[#0095F6] hover:bg-[#3192d2] text-white'}
            variant={isFollowing ? 'secondary' : 'default'}
          >
            {followLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
          </Button>
        )}

        {user && user?._id === post?.author._id && (
          <Dialog>
            <DialogTrigger asChild>
              <MoreHorizontal className='cursor-pointer' />
            </DialogTrigger>
            <DialogContent className="flex flex-col items-center text-sm text-center">
              <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-fit">Delete</Button>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <img
        className='rounded-sm my-2 w-full aspect-square object-cover'
        src={post.image}
        alt="post_img"
      />

      <div className='flex items-center justify-between my-2'>
        <div className='flex items-center gap-3'>
          {liked
            ? <FaHeart onClick={likeOrDislikeHandler} size={'24'} className='cursor-pointer text-red-600' />
            : <FaRegHeart onClick={likeOrDislikeHandler} size={'22px'} className='cursor-pointer hover:text-gray-600' />
          }

          <MessageCircle onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }} className='cursor-pointer hover:text-gray-600' />
          {/* <Send className='cursor-pointer hover:text-gray-600' /> */}
        </div>
        {/* <Bookmark onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-600' /> */}
      </div>

      <span className='font-medium block mb-2'>{postLike} likes</span>

      <p>
        <span className='font-medium mr-2'>{post.author?.username}</span>
        {post.caption}
      </p>

      {comment.length > 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
          className='cursor-pointer text-sm text-gray-400'
        >
          View all {comment.length} comments
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} />

      <div className='flex items-center justify-between'>
        <input
          type="text"
          placeholder='Add a comment...'
          value={text}
          onChange={changeEventHandler}
          className='outline-none text-sm w-full'
        />
        {text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>}
      </div>
    </div>
  )
}

export default Post