import { userModel } from "../../models/users.model.js";
import bcrypt, { hashSync } from "bcrypt";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { providerEnum } from "../../common/enum/user.enum.js";
import * as db_service from "../../DB/db.service.js";
import { Compare, Hash } from "../../common/securiity/hash.security.js";
import { decrypt, encrypt } from "../../common/securiity/encrypt.security.js";
import { GenerateToken, VerifyToken } from "../middlewares/token.js";

export const signUp = async (req, res, next) => {
    const { userName, email, password, age, gender, phone } = req.body;

    // 1. Check if the user already exists
    const emailExist = await db_service.findOne({
       model: userModel ,
        filter: {email} 
      });
    if (emailExist) {
        throw new Error("Email already exists",{cause:409});
    }

const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const user = await db_service.create({
        model: userModel,
        data: {
            userName,
            email,
            password: Hash({ plainText: password, salt_rounds: 10 }),
            age,
            gender,
            phone: encrypt(phone),
            otp,                
            confirmed: false    
        }
    });

    res.status(201).json({ message: "done", user });
};

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Check if user exists with this email AND signed up via 'system'
const userExist = await userModel
    .findOne({ email, provider: providerEnum.System })
    .select("+password");

    if (!userExist) {
          throw new Error("User does not exist",{cause:400});
    }

    // 2. Validate password
    if (!Compare({ plainText: password, cipherText: userExist.password })) {
      throw new Error("Invalid password",{cause:400});
    }
// OTP
    if (!userExist.confirmed) {
    throw new Error("Please verify your account", { cause: 400 });
}

   // 3. generate token 
   const token = GenerateToken({payload: { id: userExist._id}, secret_key: "Eng.Mai",options : {expiresIn: "1h"}}); 

    // 4. Success response
    return res.status(200).json({
        message: "done",
        user: {
            ...userExist._doc,
            phone: decrypt(userExist.phone)
        },
        token: token
    });
};

export const getProfile = async (req, res, next) => {

    return res.status(200).json({message: "done", data: { ...req.user._doc, phone: decrypt(req.user.phone) }});

};

export const verifyOTP = async (req, res, next) => {

    const { email, otp } = req.body;

    const user = await db_service.findOne({
        model: userModel,
        filter: { email }
    });

    if (!user) {
        throw new Error("User not found", { cause: 404 });
    }

    if (user.otp !== otp) {
        throw new Error("Invalid OTP", { cause: 400 });
    }

    user.confirmed = true;
    user.otp = undefined;

    await user.save();

    return res.status(200).json({
        message: "Account verified successfully"
    });
};





