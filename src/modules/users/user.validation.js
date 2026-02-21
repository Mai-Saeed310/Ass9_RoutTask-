import joi from "joi"
import { genderEnum, roleEnum } from "../../common/enum/user.enum.js";


export const signUpSchema = {
    body: joi.object({
        userName: joi.string().min(3).max(40).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
        age: joi.number().integer().positive().required(),
        gender: joi.string().valid(...Object.values(genderEnum)).required(),
        phone: joi.string().required(),
        role: joi.string().valid(...Object.values(roleEnum))

    }).required()
};


export const signInSchema = {
    body: joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
    }).required(),

    // query: joi.object({
    //  email: joi.string().required(),
    //  password: joi.string().min(8),
    // }).required(),
}