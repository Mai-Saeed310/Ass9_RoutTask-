import joi from "joi"
import { genderEnum, roleEnum } from "../../common/enum/user.enum.js";
import { Types } from "mongoose";
import { general_rules } from "../../utilities/generalRules.js";


export const signUpSchema = {
    body: joi.object({
        userName: joi.string().trim().min(3).max(40).required(),
        email: general_rules.email.required(),
        password: general_rules.password.required(),
        age: general_rules.age.required(),
        gender: general_rules.gender.required(),
        phone: general_rules.phone.required(),
        role: joi.string().valid(...Object.values(roleEnum))

    }).required().messages({
    "any.required": "Body must not be empty"
}), 
// if we use single method 
    // file: joi.object({
    // fieldname: joi.string().required(),
    // originalname: joi.string().required(),
    // encoding: joi.string().required(),
    // mimetype: joi.string().required(),
    // destination: joi.string().required(),
    // filename: joi.string().required(),
    // path: joi.string().required(),
    // size: joi.number().required(),
    // }).required().messages({
    // 'any.required': "file is required"
    // })

// if we use array method 
// files: joi.array().max(2).items(
//   joi.object({
//     fieldname: joi.string().required(),
//     originalname: joi.string().required(),
//     encoding: joi.string().required(),
//     mimetype: joi.string().required(),
//     destination: joi.string().required(),
//     filename: joi.string().required(),
//     path: joi.string().required(),
//     size: joi.number().required(),
//   }).required().messages({
//     'any.required': "file is required"
//   })
// ).required()

// if we use feilds 
files: joi.object({
  attachment: joi.array().max(1).items(
    general_rules.file.required().messages({
      'any.required': "attachment is required"
    })
  ).required(),
  attachments: joi.array().max(2).items(
   general_rules.file.required().messages({
      'any.required': "attachments is required"
    })
  ).required(),
}).required()

};


export const signInSchema = {
    body: joi.object({
        email: general_rules.email.required(),
        password: general_rules.password.required(),
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
            return isValid ? value : helper.message("invalid mongodb id")
        })
        
    }).required()
}


export const updateProfileSchema = {
    body: joi.object({
        firstName: joi.string().trim().min(3).max(40),
        lastName: joi.string().trim().min(3).max(40),
        age: general_rules.age,
        gender: general_rules.gender,
        phone: general_rules.phone

    }).required()
};


export const updatePasswordSchema = {
    body: joi.object({
        newPassword: general_rules.password.required(),
        cPassword: joi.string().valid(joi.ref("newPassword")),
        oldPassword: general_rules.password.required(),
    }).required()
}

export const confirmEmailSchema = {
  body: joi.object({
    email: general_rules.email.required(),
    otp: joi.string().length(6).required(),
  }).required()
}