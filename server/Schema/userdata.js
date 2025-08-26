import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 3 },
    phone: { type: Number, required: true, minlength: 10,maxlength:10 },
    img: { type: String, required: false},
    description:{type:String,required:false}
  });



  export default userSchema;
