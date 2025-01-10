const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'ahkfui89e589#$(#$*jfoenuisbulknsiuu93u589'

const authenticateUser = (req, res, next) => {
   const authHeader = req.headers.authorization;
   // console.log(authHeader)
 
   if (!authHeader || !authHeader.startsWith('Bearear ')) {
     return res.status(401).json({ message: 'Unauthorized. Token missing or invalid.' });
   }
 
   const token = authHeader.split(' ')[1];
   
   try {
     const decoded = jwt.verify(token, JWT_SECRET);
     req.user = { id: decoded.id }; // Attach the user ID from the token to the request
     next();
   } catch (error) {
     return res.status(401).json({ message: 'Unauthorized. Token invalid or expired.' });
   }
 };

router.post('/signup', async(req, res)=>{
   try {
      const {username, email, password} = req.body;

      if([username, email, password].some((field)=> field?.trim() === "")){
         return res.status(400).json({message : "All Fields Are Reuired"})
      }

      const existedUser = await User.findOne({
         $or : [{username},{email}]
      })

      if(existedUser){
         return res.status(400).json({message : "User with Email or Username already exists"})
      }

      const user = await User.create({
         username,
         email,
         password
      })
      // console.log(user)

      if(!user){
         return res.status(400).json({message : "User Not Crearted"})
      }

      return res.status(200).json({
         msg: "User Created",
      })

   } catch (error) {
      console.error("Error while creating user", error)
      res.status(500).json({ error: 'Internal server error.' });
   }
})

router.post('/signin', async(req,res)=>{
   try {
      const {username, password} = req.body;
   
      if([username, password].some((field)=> field?.trim() === "")){
         return res.status(400).json({message : "username and passwords both fields are reuired"})
      }
   
      const user = await User.findOne({username})
   
      if(!user){
         return res.status(400).json({message : "User does not exists"})
      }
   
      const isPasswordCorrect = await user.isPasswordCorrect(password);
   
      if(!isPasswordCorrect){
         return res.status(400).json({message : "Password Incorrect"})
      }

      const token = jwt.sign(
         { id: user._id, username: user.username },
         JWT_SECRET,
         { expiresIn: '1h' } 
       );
   
      return res.status(200).json({
         msg: `${username} LoggedIn Successfully`,
         token,
      })
   } catch (error) {
      console.error("Error while user login", error)
      res.status(500).json({ error: 'Internal server error.' });
   }
})

router.post('/forget-password',authenticateUser, async(req,res)=>{
   try {
      const { oldPassword, newPassword } = req.body

      if (!newPassword) {
         return res.status(301).json({message: "Please Provide New Password"});
      }
      const user = await User.findById(req.user?.id)
      // console.log(user)
      // console.log("HERE___")
      const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
      
      if (!isPasswordCorrect) {
         return res.status(400).json({message: "Invaild old Password"});
      }
      
      user.password = newPassword

      await user.save({ validateBeforeSave: false })

    return res.status(200).json({message: "Password Changed Successfully"})
      
   } catch (error) {
      console.error("Error while user changing password", error)
      res.status(500).json({ error: 'Internal server error.' });
   }
})

module.exports = router;