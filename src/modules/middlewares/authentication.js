import { userModel } from "../../models/users.model.js";
import { VerifyToken } from "./token.js";
import * as db_service from "../../DB/db.service.js";
import { ACCESS_SECRET_KEY, PREFIX } from "../../../config/config.service.js";
import { revokeTokenModel } from "../../models/revokeToken.model.js";
import { get, revoke_key } from "../../redis/redis.service.js";



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
    // decoded = payload 
    const decoded = VerifyToken({ token: token, secret_key: ACCESS_SECRET_KEY})
    if (!decoded || !decoded?.id) {
        throw new Error("inValid token");
    }
    // to ensure that user is exist in the DB 
    const user = await db_service.findById({ model: userModel, id: decoded.id, options: { select: "+password" }})
    if (!user) {
        throw new Error("user not exist", { cause: 400 });
    }

    // to handle logout all devices
    if (user?.changeCredential?.getTime() > decoded.iat * 1000){
         throw new Error("inValid token. Please login again.");
    }
    // to handle logout from current device
        // const revokeToken = await db_service.findOne({ 
        // model: revokeTokenModel, 
        // filter: { tokenId: decoded.jti } 
        // });

        const revokeToken = await get({ key: revoke_key({ userId: user._id, jti: decoded.jti }) });

        if (revokeToken) {
            throw new Error("Token revoked. Please login again.");
        }

    req.user = user;
    req.decoded = decoded;
    next();
}