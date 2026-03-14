import express from "express";
import { checkConncetionDB } from "./DB/connectionDB.js";
import { userRouter } from "./modules/users/user.controller.js";
import cors from 'cors'; 
import { PORT } from "../config/config.service.js";
import fs from "fs"
import { redisClient, redisConnection } from "./DB/redis.db.js";

const app = express(); 
const port = PORT ; 


const bootstrap = async () => { 

    checkConncetionDB(); 
    redisConnection();
    app.use(cors());
    app.use("/uploads",express.static("uploads"));
    app.use(express.json());
    app.use("/users",userRouter);

    

    app.get("/", (req,res)=>{
    res.status(200).send("Let's start our Ass8 ");
    });

    app.use("{/*demo}",(req,res)=>{
        throw new Error(`This page ${req.originalUrl} Not found`,{cause:404});   

});

    // Global Error Middleware
    app.use((err, req, res, next) => {

    // to delete uploaded file or files if an error occur
    if (req.file) {
        if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        }
    }
    if (req.files) {
        if (Array.isArray(req.files)) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }else {
        for (const key in req.files) {
            for (const file of req.files[key]) {
                if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
                }
            }
            }
        }
    }


    res.status(500).json({
        status: err.cause || 500,
        message: err.message
    });
    });


    app.listen(port,()=>{
        console.log(`Server is running on ${PORT}`);
    });
};



export default bootstrap ; 