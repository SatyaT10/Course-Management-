const Student = require('../models/student');
const bcrypt = require('bcrypt');
const Course = require('../models/courseModel');
const Enrollement = require('../models/enrollement');
const admin_Controllers = require('../controllers/adminControllers');
const nodemailer = require('nodemailer');
const config = require('../config/config')
const { Queue } = require('bullmq')
const { redis } = require('redis');
// const { Worker } = require('worker_threads');
// const Worker5 = require('../worker/studentWorker');

const { log } = require('console');



const securePassword = async (password) => {
    try {
        const hashPassword = await bcrypt.hash(password, 10);
        return hashPassword;

    } catch (error) {
        console.log(error);
    }
}


const enrollCourse = async (req, res) => {
    try {
        const reqBody = req.body;
        const { name, email, password, mobile, course_id } = reqBody;
        if (!name || !email || !password || !mobile || !course_id)
            return res.status(400).send({ success: true, msg: "Please Fill All the Requried Field" });
        const userData = await Student.findOne({ email: email });
        if (userData)
            return res.status(400).send({ success: false, msg: "This Email is all Ready Exists Please Login and Enroll A new Course!" });
        const courseData = await Course.findOne({ _id: course_id });
        if (courseData) {
            const newPassword = await securePassword(password);
            await Student.create({
                name: name,
                email: email,
                mobile: mobile,
                password: newPassword
            });
            const studentData = await Student.findOne({ email: email });
            await Enrollement.create({
                course_id: courseData._id,
                enrollement_id: studentData._id
            });
            const courseName = await Course.findOne({ _id: course_id });
            await sendMail(studentData.name, studentData.email, courseName.course_Name);
            const response = {
                success: true,
                msg: "Course Enroll!",
                Course_Name: courseName.course_Name
            }
            res.status(200).send(response);
        } else {
            res.status(400).send({ success: false, msg: "This is Course is Not avilible" });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const allCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({});
        const response = {
            success: true,
            msd: "All Courses is here",
            Course: allCourses
        }
        res.status(200).send(response);
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

// for send mail



const sendMail = async (name, email, course_Name) => {
    try {
        var transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            secure: false,

            auth: {
                user: config.userName,
                pass: config.password
            }
        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'Welcome Mail',
            html: '<p>Hii' + name + 'Welcome with us, You have Enroll this course' + course_Name + '</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Email has been sent:-", info.response);
            }
        })


    } catch (error) {
        console.log(error.message);
    }
}


const studentLogin = async (req, res) => {
    try {
        const reqBody = req.body;
        const { email, password } = reqBody;
        if (!email || !password) {
            res.status(400).send({ success: false, msg: "Please Fill All The Required Fields!" });
        }
        const studentData = await Student.findOne({ email: email });
        if (studentData) {
            const passwordMatch = await bcrypt.compare(password, studentData.password);
            if (passwordMatch) {
                const tokenData = await admin_Controllers.Create_Token(studentData);
                const updatedData = await Student.findOne({ email: email });
                res.status(200).send({ success: true, msg: "Welcome to Your Profile!", data: updatedData, token: tokenData });
            } else {
                res.status(400).send({ success: false, msg: "Email Or Password Is Wrong!" });
            }
        } else {
            res.status(400).send({ success: false, msg: "Email Or Password Is Wrong!" });
        }

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const myCourse = async (req, res) => {
    try {
        const authUser = req.user.userData;
        const studentData = await Student.findOne({ _id: authUser.userId });
        const courseData = await Enrollement.find({ enrollement_id: authUser.userId });
        res.status(200).send({ success: true, msg: "All Course Is Here", Data: courseData });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const byNewCourse = async (req, res) => {
    try {
        const authUser = req.user.userData;
        const reqBody = req.body;
        const { course_id } = reqBody;
        const studentData = await Student.findOne({ _id: authUser.userId });
        if (studentData) {
            const courseData = await Course.findOne({ _id: course_id });
            if (courseData) {
                await Enrollement.create({
                    course_id: courseData._id,
                    enrollement_id: studentData._id
                });
                const courseName = await Course.findOne({ _id: course_id });
                // let worker = new Worker('../worker/studentWorker.js');
                // Worker.on('sendMail(studentData.name, studentData.email, courseName.course_Name)')
                // await sendMail(studentData.name, studentData.email, courseName.course_Name);
                const sendMailQuea = new Queue('email-Queue', {
                    connection: {
                        host: '127.0.0.1',
                        port: '6379'
                    }
                });
                async function sendMail2() {
                    sendMailQuea.add("usres", {
                        name: studentData.name,
                        email: studentData.email,
                        courseName: courseName.course_Name
                        // emailData
                    })
                }
                await sendMail2().connect;
                const response = {
                    success: true,
                    msg: "Course Enroll!",
                    Course_Name: courseName.course_Name
                }
                res.status(200).send(response);
            } else {
                res.status(400).send({ success: false, msg: "This Course is not Vilible Right Now!" });
            }
        } else {
            res.status(400).send({ success: false, msg: "go to the link of enroll Course!" });
        }

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

module.exports = {
    enrollCourse,
    securePassword,
    allCourses,
    studentLogin,
    myCourse,
    byNewCourse
}

