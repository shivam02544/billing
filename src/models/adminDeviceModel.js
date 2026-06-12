import mongoose from "mongoose";

const adminDeviceSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    default: "admin" 
  },
  // We store the WebAuthn IDs as Base64URL strings for easy serialization
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

const AdminDevice = mongoose.models.AdminDevice || mongoose.model("AdminDevice", adminDeviceSchema);

export default AdminDevice;
