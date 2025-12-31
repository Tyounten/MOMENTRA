import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8000/api/v1/user/register', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
                setInput({
                    username: "",
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(user){
            navigate("/");
        }
    },[])
    return (
        <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Card className="w-[400px] shadow-xl border-0 bg-white/90 backdrop-blur-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            <span className="text-blue-600">MOMENT</span>RA
          </CardTitle>
          <p className="text-center text-sm text-gray-600">Signup to the conversation today</p>
        </CardHeader>
        <CardContent>
            <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8'>
                <div className="relative mt-1">
                    <span className="font-medium text-gray-700">Username</span>
                    <Input
                        type="text"
                        name="username"
                        value={input.username}
                        onChange={changeEventHandler}
                        placeholder="Enter a username"
                        className="fw-full mt-1 focus-visible:ring-blue-500 focus-visible:ring-2 rounded-lg"
                    />
                </div>
                <div className="relative mt-1">
                    <span className="font-medium text-gray-700">Email</span>
                    <Input
                        type="email"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        placeholder="Enter the Email"
                        className="fw-full mt-1 focus-visible:ring-blue-500 focus-visible:ring-2 rounded-lg"
                    />
                </div>
                <div className="relative mt-1">
                    <span className="font-medium text-gray-700">Password</span>
                    <Input
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        placeholder="Enter a password"
                        className="fw-full mt-1 focus-visible:ring-blue-500 focus-visible:ring-2 rounded-lg"
                    />
                </div>
                {
                    loading ? (
                        <Button>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Please wait
                        </Button>
                    ) : (
                        <Button type='submit'>Signup</Button>
                    )
                }
                <span className='text-center'>Already have an account? <Link to="/login" className='text-blue-600'>Login</Link></span>
            </form>
            </CardContent>
      </Card>
        </div>
    )
}

export default Signup