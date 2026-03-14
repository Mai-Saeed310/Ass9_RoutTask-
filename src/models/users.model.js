import mongoose from "mongoose";
import { genderEnum, providerEnum, roleEnum } from "../common/enum/user.enum.js";
const { Schema } = mongoose;

const userSchema = new Schema({
firstName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 20,
        trim: true,
    },
lastName: {
        type: String,
        minLength: 3,
        maxLength: 20,
        trim: true,
        required: true
    },
gender: {
        type: String,
        enum: Object.values(genderEnum),
        default: genderEnum.female
    },
age: {
        type: Number,
        min: 20,
        max: 60
    },
    email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
},
role: {
        type: String,
        enum: Object.values(roleEnum),
        default: roleEnum.user
    },
password: {
    type: String,
    minLength: 6,
    select: false,
    required: function (){
        return this.provider == providerEnum.Google ? false : true
    },

},
phone: { 
        type: String
    },
    profilePicture: String,
    // profilePicture: {
    //     secure_url: {type:String, require:true},
    //     public_id : {type:String, require:true}
    // },
    coverPictures: {
        type: [String],
        default: []
    },
    
    gallery: {
        type: [String],
        default: []
    },
    //    coverPictures: [{
    //     secure_url: {type:String, require:true},
    //     public_id : {type:String, require:true}
    // }],

    // for checking if a user has verified his email.
    confirmed: Boolean,
    provider: {
        type: String,
        enum: Object.values(providerEnum),
        default: providerEnum.System
    },
    changeCredential: Date 
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
