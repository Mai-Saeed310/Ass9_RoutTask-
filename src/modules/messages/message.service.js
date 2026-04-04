import * as db_service from "../../DB/db.service.js";
import { messageModel } from "../../models/messages.model.js";
import { userModel } from "../../models/users.model.js";



export const sendMessage = async (req, res, next)=> {
    const {content, userId} = req.body;

    const user = await db_service.findById({
    model: userModel,
    id: userId
    })

    if(!user){
        throw new Error ("user does not exist")
    }

    let arr = [] ; 
    if(req.files.length){
        for (const file of req.files) {
            arr.push(file.path)
        }
    }
    const message = await db_service.create({
        model: messageModel, 
        data: {
            content: content,
            userId: user._id,
            attachments: arr
        }
    });
    res.status(201).json({ message: "done", message });
};


export const getMessage = async (req, res, next) => {
    const { messageId } = req.params;

    const message = await db_service.findOne({
        model: messageModel,
        filter: {
            _id: messageId,
            userId: req.user._id // Ensuring the user can only see their own messages
        }
    });
    // Handle case where message is not found
    if (!message) {
        throw new Error ("Message not found", { cause: 404 });
    }

    res.status(201).json({ message: "done", data: message});

};

export const getMessages = async (req, res, next) => {
    // Fetching all messages belonging to the logged-in user
    const messages = await db_service.find({
        model: messageModel,
        filter: {
            userId: req.user._id 
        }
    });

    // If no messages exist, we still return 200 but with an empty array
    // This is better than returning null or throwing an error for a list view
        res.status(200).json({ message: "done", data: { messages: messages || [] } });

  
};

