import mongoose from "mongoose";
import { genderEnum, providerEnum } from "../common/enum/user.enum.js";
const { Schema } = mongoose;

const userSchema = new Schema({
firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 6,
        trim: true,
    },
lastName: {
        type: String,
        minLength: 3,
        maxLength: 6,
        trim: true,
        required: true
    },
gender: {
        type: String,
        enum: Object.values(genderEnum),
        default: genderEnum.male
    },
age: {
        type: Number,
        required: true,
        min: 20,
        max: 60
    },
    email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
},
password: {
    type: String,
    required: true,
    minLength: 6,
    select: false
},
phone: { 
        type: String, 
        required: true 
    },
    profilePicture: String,
    // for checking if a user has verified his email.
confirmed: {
   type: Boolean,
   default: false
},
    provider: {
        type: String,
        enum: Object.values(providerEnum),
        default: providerEnum.System
    },
    otp: String
}, {
    timestamps: true,
    // ensures that Mongoose filters out any fields in the query that aren't defined in the schema,
    strictQuery: true,
    toJSON:{virtuals:true}
})

// --- Virtuals ---
userSchema.virtual("userName")
    .get(function () {
        return this.firstName + " " + this.lastName
    })
    .set(function (v) {
        const [firstName, lastName] = v.split(" ")
        this.set({ firstName, lastName })
    })

// create model
export const userModel = mongoose.model("userModel", userSchema);
