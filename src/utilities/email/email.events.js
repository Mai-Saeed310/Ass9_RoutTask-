import { EventEmitter } from "node:events";


export const eventEmitter = new EventEmitter();

eventEmitter.on("comfirmEmail",async (fn)=>{
    await fn();
})