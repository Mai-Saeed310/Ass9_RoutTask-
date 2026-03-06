import { userModel } from "../../models/users.model.js";
import { VerifyToken } from "./token.js";
import * as db_service from "../../DB/db.service.js";
import { ACCESS_SECRET_KEY, PREFIX } from "../../../config/config.service.js";



export const authentication = async (req, res, next) => {
    const { authorization } = req.headers; 
    // user did not login   
    if (!authorization) {
        throw new Error("token not exist");
    }

    const [prefix,token] = authorization.split(" "); 
    if(prefix !== PREFIX){
        throw new Error("inValid prefix");        
    }
    
    // if user is login --> then verify the token 
    const decoded = VerifyToken({ token: token, secret_key: ACCESS_SECRET_KEY})

    if (!decoded || !decoded?.id) {
        throw new Error("inValid token");
    }
    // to ensure that user is exist in the DB 
    const user = await db_service.findById({ model: userModel, id: decoded.id, options: { select: "+password" }})
    if (!user) {
        throw new Error("user not exist", { cause: 400 });
    }
    req.user = user;
    next();
}