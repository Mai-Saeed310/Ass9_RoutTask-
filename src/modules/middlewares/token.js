import jwt from "jsonwebtoken";

// middleware func to get and verify  token from the header 

export const GenerateToken = ({ payload, secret_key, options = {} } = {}) => {
    return jwt.sign(payload, secret_key, options)
}

export const VerifyToken = ({ token, secret_key, options = {} } = {}) => {
    return jwt.verify(token, secret_key, options)
}
