import { Router } from "express"; 
import * as US from "./user.service.js";
import { authentication } from "../middlewares/authentication.js";


export const userRouter = Router (); 

userRouter.post("/signUp", US.signUp);
userRouter.post("/verify-otp", US.verifyOTP);
userRouter.post("/signIn", US.signIn);
userRouter.get("/profile", authentication, US.getProfile);




