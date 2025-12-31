import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
    name: "socketio",
    initialState: {
        socket: null,       // If keeping, be aware this is non‑serializable
        connected: false,   // New: connection flag
    },
    reducers: {
        setSocket: (state, action) => {
            state.socket = action.payload;
        },
        setConnected: (state, action) => {
            state.connected = action.payload; // true or false
        }
    }
});

export const { setSocket, setConnected } = socketSlice.actions;
export default socketSlice.reducer;
