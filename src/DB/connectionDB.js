import mongoose from 'mongoose';
import { DB_URI } from '../../config/config.service.js';



export const checkConncetionDB = async () => {
  try {

    await mongoose.connect(DB_URI);
    console.log("Connection has been established successfully.");


  } catch (error) {
    console.error("Unable to connect to the server:", error);
  }
};


