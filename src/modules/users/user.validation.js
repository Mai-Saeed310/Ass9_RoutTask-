import joi from "joi"
import { genderEnum, roleEnum } from "../../common/enum/user.enum.js";
import { Types } from "mongoose";


export const signUpSchema = {
    body: joi.object({
        userName: joi.string().trim().min(3).max(40).required(),
        email: joi.string().trim().email().required(),
        password: joi.string().min(6).required(),
        age: joi.number().integer().positive().required(),
        gender: joi.string().valid(...Object.values(genderEnum)).required(),
        phone: joi.string().pattern(/^01[0-2,5]{1}[0-9]{8}$/).required(),
        role: joi.string().valid(...Object.values(roleEnum))

    }).required().messages({
    "any.required": "Body must not be empty"
})
};


export const signInSchema = {
    body: joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
    }).required().messages({
    "any.required": "Body must not be empty"
}),

    // query: joi.object({
    //  email: joi.string().required(),
    //  password: joi.string().min(8),
    // }).required(),
}


export const shareProfileSchema = {
    params: joi.object({
        id: joi.string().custom((value,helper)=>{
            const isValid = Types.ObjectId.isValid(value)
            return isValid ? value : helper.message("invalid id")
        })
        
    }).required()
}


export const updateProfileSchema = {
    body: joi.object({
        firstName: joi.string().trim().min(3).max(40),
        lastName: joi.string().trim().min(3).max(40),
        age: joi.number().integer().positive(),
        gender: joi.string().valid(...Object.values(genderEnum)),
        phone: joi.string().pattern(/^01[0-2,5]{1}[0-9]{8}$/)

    }).required()
};


export const updatePasswordSchema = {
    body: joi.object({
        newPassword: joi.string().min(6).required(),
        cPassword: joi.string().valid(joi.ref("newPassword")),
        oldPassword: joi.string().min(6).required(),
    }).required()
}