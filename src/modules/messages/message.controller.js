import { Router } from "express"; 
import { multer_local } from "../middlewares/multer.js";
import { validation } from "../middlewares/validation.js";
import * as MS from './message.service.js'
import * as Schema from "./message.validation.js";
import { multer_enum } from "../../common/enum/multer.enum.js";
import { authentication } from "../middlewares/authentication.js";


export const messageRouter = Router (); 

messageRouter.post("/send",
    multer_local({custom_path: "messages/message", custom_types: [...multer_enum.image] }).array("attachments",  3),
    validation(Schema.sendMessageSchema),MS.sendMessage
)

messageRouter.get("/:messageId",authentication,validation(Schema.getMessageSchema),MS.getMessage);
messageRouter.get("/",authentication,MS.getMessages);
