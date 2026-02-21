import { Router } from "express"; 
import * as US from "./user.service.js";
import { authentication } from "../middlewares/authentication.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import { authorization } from "../middlewares/authorization.js";
import { validation } from "../middlewares/validation.js";
import { signInSchema, signUpSchema } from "./user.validation.js";


export const userRouter = Router (); 

userRouter.post("/signUp",validation(signUpSchema),US.signUp);
// userRouter.post("/verify-otp", US.verifyOTP);
userRouter.post("/signIn",validation(signInSchema) , US.signIn);
userRouter.get("/profile", authentication,authorization([roleEnum.user]), US.getProfile);

userRouter.post("/signup/gmail", US.signUpWithGmail);



