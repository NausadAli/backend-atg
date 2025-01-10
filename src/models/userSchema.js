const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = mongoose.Schema({
   username: { 
      type: String, 
      required: [true, "Username is Required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    email: { 
      type: String, 
      required: [true, "email is Required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type:String,
      required: [true, "Password is Required"]
    }
},
   {
      timestamps: true  //added created At and updated At timestamps
    }
  
)

userSchema.pre("save", async function (next) {

   if (!this.isModified("password")) return next()

   this.password = await bcrypt.hash(this.password, 10)
   next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', userSchema);