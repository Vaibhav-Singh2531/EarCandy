import { Message } from "../models/message-model.js";
import {User} from "../models/user-model.js"
import {  getAuth } from "@clerk/express";

export const getAllUsers = async (req,res,next) => {

    try {
        const { userId } = getAuth(req);
        const currentUserId = userId;
        const user = await User.find({ clerkId: { $ne: currentUserId } });

        if(!user) {
            return res.status(201).json({messsgae : "No user found"});
        }

        res.status(200).json(user);
        
    } catch (error) {
        next(error);
    }
    
}

export const getMessages = async (req,res,next) =>{

    try {
        const { userId } = getAuth(req);
        const myId = userId;

        const {userID} = req.params;

        const messages = await Message.find({
            $or: [
                {senderId: userID , receiverId: myId} ,
                {senderId: myId , receiverId: userID }
            ]
        }).sort({ createdAt: 1})

        res.status(200).json(messages);
        
    } catch (error) {
        console.log("Error in getMessages: ",error);
        next(error);
    }

}