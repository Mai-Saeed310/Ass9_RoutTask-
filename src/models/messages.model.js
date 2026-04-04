import mongoose from 'mongoose';
const { Schema } = mongoose;

const messageSchema = new Schema({
    content: {
        type: String,
        required: [true, 'Message content is required'],
        minLength: 1
    },
    attachments: [String],
    userId: {
        type: Schema.Types.ObjectId,
        // Ensure this matches your User model's name exactly
        ref: 'userModel', 
        required: true,
    },
}, {
    timestamps: true,
    strictQuery:true
});


// create model
export const messageModel = mongoose.model("messageModel", messageSchema);

