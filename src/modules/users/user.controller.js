import { Router } from "express"; 
import * as US from "./user.service.js";
import { authentication } from "../middlewares/authentication.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import { authorization } from "../middlewares/authorization.js";
import { validation } from "../middlewares/validation.js";
import { confirmEmailSchema, shareProfileSchema, signInSchema, signUpSchema, updatePasswordSchema, updateProfileSchema } from "./user.validation.js";
import { multer_host, multer_local } from "../middlewares/multer.js";
import { multer_enum } from "../../common/enum/multer.enum.js";


export const userRouter = Router (); 

// userRouter.post("/signUp",multer_local().single("attachements"),US.signUp);

userRouter.post("/signup",
    multer_local({custom_path: "users/user", custom_types: [...multer_enum.image] }).fields([
        { name: "attachment", maxCount: 1 },
        { name: "attachments", maxCount: 2 },
    ]),
    validation(signUpSchema),US.signUp
)

// using Cloudinary to upload files 
// userRouter.post("/signup", multer_host(...multer_enum.image).single("attachment"),US.signUp); 

// userRouter.post("/verify-otp", US.verifyOTP);
userRouter.post("/signIn",validation(signInSchema), US.signIn);
userRouter.get("/profile", authentication,authorization([roleEnum.user]), US.getProfile);
userRouter.post("/signup/gmail", US.signUpWithGmail);
userRouter.get("/refresh_token", US.refreshToken);
userRouter.get("/share_profile/:id",validation(
), US.shareProfile);

userRouter.patch("/update-profile",authentication, validation(updateProfileSchema),US.updateProfile);
userRouter.patch("/update-password",authentication, validation(updatePasswordSchema),US.updatePassword);
userRouter.post("/log-out",authentication,US.logOut);



userRouter.patch("/update-profile-picture",
  authentication,
  multer_local({ custom_path: "users/profile", custom_types: [...multer_enum.image] }).single("attachment"),
  US.updateProfilePicture
);

userRouter.delete("/delete-profile-picture",authentication, US.deleteProfilePicture);

userRouter.patch("/update-cover-picture", 
  authentication,
  multer_local({ custom_path: "users/cover-picture", custom_types: [...multer_enum.image] }).array("attachments"),
  US.updateCoverPicture
);

userRouter.patch("/confirm-email",validation(confirmEmailSchema),US.confirmEmail);
userRouter.post("/resend-otp",US.resendOtp);

userRouter.post("/enable-two-step",authentication,US.enableTwoStep);
userRouter.post("/confirm-two-step",authentication,US.confirmTwoStep);
userRouter.post("/login-confirm-otp",US.loginConfirmOTP);
userRouter.post("/update-passward",authentication,US.updatePassword );
userRouter.post("/forget-passward",US.forgetPassword );
userRouter.post("/reset-passward",US.resetPassword );
