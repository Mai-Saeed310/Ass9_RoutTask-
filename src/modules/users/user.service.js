import { userModel } from "../../models/users.model.js";
import bcrypt, { hashSync } from "bcrypt";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { providerEnum } from "../../common/enum/user.enum.js";
import * as db_service from "../../DB/db.service.js";
import { Compare, Hash } from "../../common/securiity/hash.security.js";
import { decrypt, encrypt } from "../../common/securiity/encrypt.security.js";
import { GenerateToken, VerifyToken } from "../middlewares/token.js";
import {OAuth2Client} from 'google-auth-library';
import { ACCESS_SECRET_KEY, CLIENT_ID, PREFIX, REFRESH_SECRET_KEY, SALT_ROUNDS } from "../../../config/config.service.js";
import cloudinary from "../../utilities/cloudinary.js";
import { randomUUID } from "crypto";
import { revokeTokenModel } from "../../models/revokeToken.model.js";
import { block_login_key, block_otp_key, deleteKey, expire, get, get_key, incr, keys, login_attempts_key, max_otp_key, otp_key, revoke_key, setValue, ttl } from "../../redis/redis.service.js";
import fs from "node:fs";
import { generateOtp, sendEmail } from "../../utilities/email/send.email.js";
import { EventEmitter } from "events";

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
    // const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path,{folder:"user/profile",resource_type:"image"}); 

    let arr_paths = []
        for (const file of req.files.attachments) {
            arr_paths.push(file.path)
        }

        if (arr_paths.length !== 2) {
            throw new Error("Cover pictures must be exactly 2 images", { cause: 400 })
        }

    const user = await db_service.create({
        model: userModel,
        data: {
            userName,
            email,
            password: Hash({ plainText: password }),
            gender,
            phone: encrypt(phone),
            profilePicture:  req.files.attachment[0].path,
            coverPictures: arr_paths
        }
    })

    const otp = await generateOtp();
    await sendEmail({
    to: email,
    subject: "welcome to saraha app",
    html: `<h1>hello ${userName}</h1>
    <p>Your otp is : ${otp}</p>`
    });

    await setValue({ 
    key: otp_key({email}), 
    value: Hash({ plainText: `${otp}` }), 
    ttl: 60 * 2 
    });

    await setValue({ key: max_otp_key({ email }), value: 1, ttl: 60 *6  })

    res.status(201).json({ message: "done", user });
};

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Check if user exists with this email AND signed up via 'system'
    const userExist = await userModel
    .findOne({ email, provider: providerEnum.System ,confirmed: { $exists: true }})
    .select("+password");

    if (!userExist) {
          throw new Error("User does not exist",{cause:400});
    }

    // check if user is blocked
    const isBlocked = await ttl(block_login_key({ email }));
    if (isBlocked > 0) {
        throw new Error(`Your account is blocked, try again after ${isBlocked} seconds`, { cause: 400 });
    }

    // 2. Validate password
    if (!Compare({ plainText: password, cipherText: userExist.password })) {
     const attempts_key = login_attempts_key({ email });

    // increase attempts
    const attempts = await incr(attempts_key);

    // ttl for the attempts 
    await expire({ key: attempts_key, ttl: 60*10 });

     // block after 5 tries
        if (attempts >= 5) {
            await setValue({
                key: block_login_key({ email }),
                value: 1,
                ttl: 60 * 5 // 5 minutes
            });

            await deleteKey(login_attempts_key({ email }));
            throw new Error("Account blocked for 5 minutes", { cause: 400 });
        }

        throw new Error("Invalid password", { cause: 400 });
    }

    // reset attempts after success
    await deleteKey(login_attempts_key({ email }));

    // 2-step verification
    if (userExist.two_step_enabled) {
        await sendEmailOtp({ email: userExist.email, subject: "Login Verification" });
        return res.status(200).json({
            message: "OTP sent to your email for 2-step verification"
        });
    }

    // to generate random token Id 
    const jwtId = randomUUID();
   // 3. generate tokens
   const access_token = GenerateToken({
    payload: { id: userExist._id},
    secret_key: ACCESS_SECRET_KEY,
    options : {
        expiresIn: "1h",
        jwtid: jwtId
    }
   }); 

   const refresh_token = GenerateToken({
    payload: { id: userExist._id},
    secret_key: REFRESH_SECRET_KEY,
    options : {
        expiresIn: "1y",
        jwtid: jwtId
    }
    }); 

    // 4. Success response
    return res.status(200).json({
        message: "done",
        user: {
            ...userExist._doc,
            phone: decrypt(userExist.phone)
        },
        access_token: access_token,
        refresh_token: refresh_token
    });
};

export const getProfile = async (req, res, next) => {

    return res.status(200).json({message: "done", data: { ...req.user._doc, phone: decrypt(req.user.phone) }});
// to apply cash concept 
// const key = `profile::${req.user._id}`

//     const userExist = await get({ key })
//     if (userExist) {
//         console.log("from cash");
//         return successResponse({ res, data: userExist })
//     }
//     console.log("out cash");

//     await set({ key, value: req.user, ttl: 60 })

//     successResponse({ res, data: req.user })
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

export const signUpWithGmail = async (req, res, next) => {

    const { idToken } = req.body;

        const client = new OAuth2Client();

        const ticket = await client.verifyIdToken({
            idToken,
            // client iid
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, email_verified, name, picture } = payload;

        let user = await db_service.findOne({
            model: userModel,
            filter: { email }
        });

        if (!user) {
            user = await db_service.create({
                model: userModel,
                data: {
                    email,
                    confirmed: email_verified,
                    userName: name,
                    profilePicture: picture,
                    provider: providerEnum.Google
                }
            });
        }

        if (user.provider === providerEnum.System) {
            throw new Error("please log in on system only", { cause: 400 });
        }

        const access_token = GenerateToken({
            payload: {
                id: user._id,
                email: user.email
            },
            secret_key: SECRET_KEY,
            options: {
                expiresIn: "1d",
            }
        });

        return res.status(200).json({
            message: "done",
            access_token,
            user
        });


};

export const refreshToken = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        throw new Error("token not exist");
    }
    const [prefix,token] = authorization.split(" "); 
       if(prefix !== PREFIX){
        throw new Error("inValid prefix");        
        }

    const decoded = VerifyToken({ 
        token: token, 
        secret_key: REFRESH_SECRET_KEY
    });

    if (!decoded || !decoded?.id) {
        throw new Error("inValid token");
    }
    const user = await db_service.findOne({ 
        model: userModel, 
        filter: { _id: decoded.id } 
    });
    if (!user) {
        throw new Error("user not exist", { cause: 400 });
    }

     const revokeToken = await db_service.findOne({ 
            model: revokeTokenModel, 
            filter: { tokenId: decoded.jti } 
            });
    
            if (revokeToken) {
                throw new Error("Token revoked. Please login again.");
            }

            
    const refresh_token = GenerateToken({
        payload: {
            id: user._id,
            email: user.email,
        },
        secret_key: ACCESS_SECRET_KEY,
        options: {
            expiresIn: "1h",
        }
    });
    return res.json({ message: "refresh_token created successfully.", refresh_token: { refresh_token } });
};

export const shareProfile = async (req, res, next) => {
    const { id } = req.params;
    const user = await db_service.findById({ model: userModel, id, options: { select: "-password -provider -createdAt -provider -updatedAt -__v" }});
    
    if (!user) {
        throw new Error("user not exist yet");
    }

    if (user.phone) {
    user.phone = decrypt(user.phone);
    }

    return res.status(200).json({data: user});

};

export const updateProfile = async (req, res, next) => {
   let {firstName, lastName, gender, age, phone} = req.body;
   if(phone){
     phone = encrypt(phone)
   }
   const user = await db_service.findOneAndUpdate({
    model: userModel, 
    filter: {_id: req.user._id},
    update: {firstName, lastName, gender, age, phone}
   });

    if (!user){
        throw new Error("user does not exist");
    }
// await deleteKey(`profile::${req.user._id}`)
    return res.status(200).json({message: "user updated successfully." , newUser: user});

};

export const updatePassword = async (req, res, next) => {
  let { oldPassword, newPassword } = req.body

  if (!Compare({ plainText: oldPassword, cipherText: req.user.password })) {
        throw new Error("inValid old password");
    }

    const hash = Hash({ plainText: newPassword })

    req.user.password = hash

    // logout from all devices 
    req.user.changeCredential = new Date();

    await req.user.save()

    return res.status(200).json({message: "password updated successfully." });

};

export const logOut = async (req, res, next) => {
// logout from all devices
    const { flag } = req.body ; 
    
    if (flag.toLowerCase() === "all"){
        req.user.changeCredential = new Date();
        await req.user.save();
        // await db_service.deleteMany({ model: revokeTokenModel, filter: { userId: req.user._id }});
        await deleteKey(await keys(get_key({ userId: req.user._id })));
    }

// logout from current device
    else{

        await setValue({
            key: revoke_key({ userId: req.user._id, jti: req.decoded.jti }),
            value: `${req.decoded.jti}`,
            ttl: req.decoded.exp - Math.floor( Date.now() / 1000)
            
        })
        // await db_service.create({
        //     model: revokeTokenModel, 
        //     data: {
        //         tokenId: req.decoded.jti,
        //         userId: req.user._id,
        //         expiredAt: new Date ( req.decoded.exp * 1000)
        //     }
        // });
    }
        
    return res.status(200).json({message: "Done." });


}; 

export const updateProfilePicture = async (req, res, next) => {

    if (!req.file) {
        throw new Error("Image is required", { cause: 400 });
    }

    let gallery = req.user.gallery;

    if (req.user.profilePicture) {
        gallery.push(req.user.profilePicture);
    }

    await db_service.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        update: {
            profilePicture: req.file.path,
            gallery: gallery
        }
    });

    return res.status(200).json({
        message: "Profile picture updated"
    });
};

export const deleteProfilePicture = async (req, res, next) => {

    if (!req.user.profilePicture) {
        throw new Error("No profile picture found", { cause: 404 });
    }

    fs.unlink(req.user.profilePicture, (err) => {
    if (err) throw err;
    });

    await db_service.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        update: { profilePicture: null }
    });

    return res.status(200).json({
        message: "Profile picture deleted successfully"
    });
};

export const updateCoverPicture = async (req, res, next) => {
    try {
        const user = req.user;
        const existingCovers = user.coverPictures || [];
        const newUploads = req.files || [];

        if (existingCovers.length >= 2)   {
            return res.status(400).json({
                message: "You already have 2 cover pictures. Cannot upload more."
            });  

            
        }

        if ((existingCovers.length + newUploads.length) > 2) {
             return res.status(400).json({
                message: `You can only upload ${2 - existingCovers.length} more cover picture(s).`
            });      
        
        }

        // Save new cover pictures paths to DB
        const newPaths = newUploads.map(file => file.path);
        const updatedCovers = [...existingCovers, ...newPaths];

        await db_service.updateOne({
            model: userModel,
            filter: { _id: user._id },
            update: { coverPictures: updatedCovers }
        });

        return res.status(200).json({message: "Cover pictures updated successfully"});

    } catch (err) {
         throw new Error (err);
    }
};

const sendEmailOtp = async ({ email, subject }) => {
  const isBlocked = await ttl(block_otp_key({ email }));
  if (isBlocked > 0) {
    throw new Error(`you blocked please try again after ${isBlocked} seconds`);
  }

  const key = otp_key({ email, subject });

  const ttlOtp = await ttl(key);
  if (ttlOtp > 0) {
    throw new Error(
      `you already have otp not expired yet please try again after ${ttlOtp} seconds`
    );
  }

  if ((await get({ key: max_otp_key({ email }) })) >= 3) {
    await setValue({
      key: block_otp_key({ email }),
      value: 1,
      ttl: 15 * 60,
    });
    throw new Error(`you exceed maximum number of trials`);
  }

  const otp = await generateOtp();

  // 
  await sendEmail({
    to: email,
    subject,
    html: `<h1>your confirmation code is:${otp}</h1>`,
  });

  await setValue({
    key,
    value: Hash({ plainText: `${otp}` }),
    ttl: 60 * 2,
  });

  await incr(max_otp_key({ email }));
};


export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body

const otpValue = await get({ key: otp_key({ email }) })
  if (!otpValue) {
    throw new Error("otp expired");
  }

  if (!Compare({ plainText: otp, cipherText: otpValue })) {
    throw new Error("inValid otp");
  }

  const user = await db_service.findOneAndUpdate({
    model: userModel,
    filter: { email ,confirmed: {$exists:false} , provider: providerEnum.System},
    update: { confirmed: true }
  })

  if (!user) {
    throw new Error("user not exist");
  }

  await deleteKey(otp_key({ email }))

    res.status(201).json({ message: "email confirmed successfully" });
}

export const resendOtp = async (req, res, next) => {
  const { email } = req.body

  const user = await db_service.findOne({
    model: userModel,
    filter: { email, confirmed: { $exists: false }, provider: providerEnum.System },
  })

  if (!user) {
    throw new Error("user not exist or already confirmed");
  }

    const isBlocked = await ttl(block_otp_key({ email }))
    if (isBlocked > 0) {
    throw new Error(`you have exceeded the maximum number of tries, please try again after ${isBlocked} seconds`);
    }

  // check if user has exsit OTP 
  const TTL = await ttl(otp_key({ email }))
  if (TTL > 0) {
    throw new Error(`you can resend otp after ${TTL} seconds`);
  }

  const maxOtp = await get({ key: max_otp_key({ email }) })

  if (maxOtp >= 3) {
    // block user 
    await setValue({ key: block_otp_key({ email }), value: 1, ttl: 60 })
    throw new Error("you have exceeded the maximum number of tries");
  }

  const otp = await generateOtp()
  await sendEmail({
    to: user.email,
    subject: "welcome to saraha app",
    html: `<h1>hello ${user.userName}</h1>
    <p>welcome to saraha app your otp is : ${otp}</p>`
  })

  await incr(max_otp_key({ email }));
    res.status(201).json({ message: "done" });

}

export const enableTwoStep = async (req, res, next) => {
    const userId = req.user.id; 
    const user = await userModel.findById(userId);

    if (!user) throw new Error("User not found", { cause: 404 });

    // OTP to active step verification
    await sendEmailOtp({ email: user.email, subject: "Enable 2-step verification" });

    return res.status(200).json({
        message: "OTP sent to your email to enable 2-step verification"
    });
};

export const confirmTwoStep = async (req, res, next) => {
    const { email, otp } = req.body;

    const user = await userModel.findById(req.user._id);
    if (!user) throw new Error("User not found", { cause: 404 });

    const hashedOtp = await get({key: otp_key({ email, subject: "Enable 2-step verification" })});
    if (!hashedOtp || !Compare({ plainText: otp, cipherText: hashedOtp })) {
        throw new Error("Invalid OTP", { cause: 400 });
    }

    // active 2-step verification
    user.two_step_enabled = true;
    await user.save();

    // delete otp after active  2-step verification
    await deleteKey(otp_key({ email, subject: "Enable 2-step verification" }));

    return res.status(200).json({ message: "2-step verification enabled successfully" });
};

export const loginConfirmOTP = async (req, res, next) => {
    const { email, otp } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) throw new Error("User not found", { cause: 404 });

    if (!user.two_step_enabled) {
        throw new Error("2-step verification is not enabled for this account", { cause: 400 });
    }

    const hashedOtp = await get({key:otp_key({ email, subject: "Login Verification" })});
    if (!hashedOtp || !Compare({ plainText: otp, cipherText: hashedOtp })) {
        throw new Error("Invalid OTP", { cause: 400 });
    }

    // otp send it correctly so delete the key
    await deleteKey(otp_key({ email, subject: "Login Verification" }));

    // toekns 
    const jwtId = randomUUID();
    const access_token = GenerateToken({
        payload: { id: user._id },
        secret_key: ACCESS_SECRET_KEY,
        options: { expiresIn: "1h", jwtid: jwtId }
    });
    const refresh_token = GenerateToken({
        payload: { id: user._id },
        secret_key: REFRESH_SECRET_KEY,
        options: { expiresIn: "1y", jwtid: jwtId }
    });

    return res.status(200).json({
        message: "Login successful",
        access_token,
        refresh_token
    });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await db_service.findOne({
    model: userModel,
    filter: {
      email,
      confirmed: { $exists: true },
      provider: providerEnum.System,
    },
  });

  if (!user) {
    throw new Error("user not exist or not confirmed");
  }

  await sendEmailOtp({ email, subject: "forgetPassword"});

    res.status(200).json({ message: "OTP send it to the email" });
};

export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  const user = await db_service.findOne({
    model: userModel,
    filter: { email },
  });

  if (!user) {
    throw new Error("User not found", { cause: 404 });
  }

  // 1. check OTP
  const storedOtp = await get({ 
    key: otp_key({ email, subject: "forgetPassword" }) 
  });

  if (!storedOtp) {
    throw new Error("OTP expired", { cause: 400 });
  }

  if (!Compare({ plainText: otp, cipherText: storedOtp })) {
    throw new Error("Invalid OTP", { cause: 400 });
  }

  // 2. update password
  user.password = Hash({ plainText: newPassword });

  // (logout from all devices)
  user.changeCredential = new Date();

  await user.save();

  // 3. delete OTP
  await deleteKey(otp_key({ email, subject: "forgetPassword" }));

  return res.status(200).json({
    message: "Password reset successfully",
  });
};