import express from "express";
import { checkConncetionDB } from "./DB/connectionDB.js";
import { userRouter } from "./modules/users/user.controller.js";
import cors from 'cors'; 
import { PORT } from "../config/config.service.js";

const app = express(); 
const port = PORT ; 


const bootstrap = () => { 

    checkConncetionDB(); 
    app.use(cors())
    app.use(express.json());
    app.use("/users",userRouter);

    

    app.get("/", (req,res)=>{
    res.status(200).send("Let's start our Ass8 ");
    });

    app.use("{/*demo}",(req,res)=>{
        throw new Error(`This page ${res.originalUrl} Not found`,{cause:404});   

});

    // Global Error Middleware
    app.use((err, req, res, next) => {
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