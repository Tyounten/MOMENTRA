import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Note: For group chats, consider making this an array or linking to Conversation
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);