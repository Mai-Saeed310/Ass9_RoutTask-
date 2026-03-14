import { redisClient } from "../DB/redis.db.js";

export const revoke_key = ({userId, jti}) => {
  return `revoke_token::${userId}::${jti}`
}
export const get_key = ({ userId }) => {
    return `revoke_token::${userId}`
}
export const setValue = async ({ key, value, ttl } = {}) => {
    try {
        // to conver data to string if it is object
        const data = typeof value === "string" ? value : JSON.stringify(value)
        // check if there is TTL 
        return ttl ? await redisClient.set(key, data, { EX: ttl }) : await redisClient.set(key, data)
    } catch (error) {
        console.log("fail to set operation", error);
    }
}

export const update = async ({ key, value } = {}) => {
    try {
        if (!await redisClient.exists(key)) {
            return 0
        }
        return await setValue({ key, value, ttl }); 

    } catch (error) {
        console.log("fail to update data", error);
    }
}

export const exists = async (key) => {
    try {
        return await redisClient.exists(key)
    } catch (error) {
        console.log("error to check data exists in redis", error);
    }
}

export const deleteKey = async ( key ) => {
    try {
        if(!key.length){
           return 0 
        }
        return await redisClient.del(key)
    } catch (error) {
        console.log("error to delete data from redis", error);
    }
}

export const get = async ({ key } = {}) => {
     if (!await redisClient.exists(key)) {
            return 0
        }
        // if the data stored as an object 
    try {
        try {
            return JSON.parse(await redisClient.get(key))
        // if data stored like a string 
        } catch (error) {
            return await redisClient.get(key)
        }
    } catch (error) {
        console.log("error to get data from redis", error);
    }
}


export const ttl = async (key) => {
    try {
        return await redisClient.ttl(key)
    } catch (error) {
        console.log("error to get ttl from redis", error);
    }
}

export const keys = async (pattern) => {
    try {
        return await redisClient.keys(`${pattern}*`)
    } catch (error) {
        console.log("error to get keys from redis", error);
    }
}

export const expire = async ({ key, ttl } = {}) => {
    try {

      return await redisClient.expire(key, ttl)
    } catch (error) {
        console.log("fail to set operation", error);
    }
}