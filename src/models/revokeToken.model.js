import mongoose from "mongoose";

export const revokeTokenSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  expiredAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
  strictQuery: true,
});

// Create a TTL index to automatically delete documents at the time specified in 'expiredAt'
revokeTokenSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

export const revokeTokenModel = mongoose.model("revokeTokenModel", revokeTokenSchema);

