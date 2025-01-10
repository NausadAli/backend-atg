const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');
const healthRoutes = require('./routes/health.routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connect to MongoDB and better Error handling
(async () => {
   try {
     await mongoose.connect(process.env.MONGO_URI, {
       dbName: 'atg-task', // Specify the database name
     });
     console.log('Connected to MongoDB');
   } catch (err) {
     console.error('Error connecting to MongoDB:', err);
   }
 })();

 // Routes
 app.use('/',(req,res)=>{
  res.json({msg:"Hello From Nousad"})
 })
app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});