import joi from "joi";
import { general_rules } from "../../utilities/generalRules.js";

export const sendMessageSchema = {
    body: joi.object({
        content: joi.string().required(),
        userId: general_rules.id.required(),
    }).required(),
    
    files: joi.array().items(general_rules.file)
};


export const getMessageSchema = {
    params: joi.object({
        messageId: general_rules.id.required(),
    }).required()
};