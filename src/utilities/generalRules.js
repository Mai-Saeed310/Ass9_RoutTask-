import joi from "joi"
import { genderEnum } from "../common/enum/user.enum.js"

export const general_rules = {
    email: joi.string().trim().email().required(),
    password: joi.string().min(6).required(),
    age: joi.number().integer().positive(),
    gender: joi.string().valid(...Object.values(genderEnum)),
    phone: joi.string().pattern(/^01[0-2,5]{1}[0-9]{8}$/),

  file: joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    destination: joi.string().required(),
    filename: joi.string().required(),
    path: joi.string().required(),
    size: joi.number().required(),
  }).messages({
    'any.required': "file is required"
  }),
}