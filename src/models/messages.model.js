import mongoose, { Types } from "mongoose";
const { Schema } = mongoose;

const noteSchema = new Schema({
 title: {
  type: String,
  required: true,
  validate: {
    validator: function (value) {
      return value !== value.toUpperCase();
    },
    message: "Title must not be entirely uppercase"
  }
},
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: Types.ObjectId,
     required: true,
     ref: "User"
  }
}, {
    timestamps: true
});
// create model
export const note =  mongoose.model("Note", noteSchema);
