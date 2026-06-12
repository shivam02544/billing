import { Schema } from "mongoose";

const adminDeviceSchema = new Schema({
  userId: { 
    type: String, 
    default: "admin" 
  },
  credentialID: { 
    type: String, 
    required: true, 
    unique: true 
  },
  credentialPublicKey: { 
    type: String, 
    required: true 
  },
  counter: { 
    type: Number, 
    required: true 
  },
  transports: { 
    type: [String], 
    default: [] 
  },
  deviceType: { 
    type: String 
  },
  backedUp: { 
    type: Boolean 
  },
}, { timestamps: true });

export default adminDeviceSchema;
