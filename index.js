const mongoose=require("mongoose");
mongoose.connect('mongodb://localhost:27017/CourseEnrolement');

const express=require('express');
const app=express();

const student_Routes=require('./routes/studentRoutes');
const admin_Routes=require('./routes/adminRoutes');
const mentor_Routes=require('./routes/mentorRoutes');


app.use('/api',student_Routes);
app.use('/api',admin_Routes);
app.use('/api',mentor_Routes);


app.listen(8000,()=>console.log("Server is Listening On Port. 8080"));

