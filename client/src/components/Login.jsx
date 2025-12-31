import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8000/api/v1/user/login', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setInput({
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

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [])
    return (
        <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <Card className="w-[400px] shadow-xl border-0 bg-white/90 backdrop-blur-md rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-gray-900">
                        <span className="text-blue-600">MOMENT</span>RA
                    </CardTitle>
                    <p className="text-center text-sm text-gray-600">Login to the conversation today</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8'>
                        <div className="relative mt-1">
                            <span className="font-medium text-gray-700">Email</span>
                            <Input
                                type="email"
                                name="email"
                                value={input.email}
                                onChange={changeEventHandler}
                                placeholder="Enter a username"
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
                                className="w-full mt-1 focus-visible:ring-blue-500 focus-visible:ring-2 rounded-lg"
                            />
                        </div>
                        {
                            loading ? (
                                <Button>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Please wait
                                </Button>
                            ) : (
                                <Button type='submit'>Login</Button>
                            )
                        }

                        <span className='text-center'>Dosent have an account? <Link to="/signup" className='text-blue-600'>Signup</Link></span>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Login