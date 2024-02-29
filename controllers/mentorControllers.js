const Mentor = require('../models/mentor');
const studentControllers = require('../controllers/studentControllers');
const admin_Controllers = require('../controllers/adminControllers');
const bcrypt = require('bcrypt');
const Course = require('../models/courseModel');
const nodemailer = require('nodemailer');


const sendMail = async (name, email, course_Name) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }


        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'Conformation Mail',
            html: '<p>Hii' + name + 'You have Upload a Courese' + course_Name + '></p>'
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


const registrataiton = async (req, res) => {
    try {
        const reqBody = req.body;
        const { name, email, password, mobile } = reqBody;

        if (!name || !email || !password || !mobile) {
            res.status(400).send({ success: false, msg: "Please fill All the Required Fields!" });
        }
        const mentorData = await Mentor.findOne({ email: email });
        if (mentorData) {
            res.status(400).send({ success: false, msg: "This email is already exists!" });
        }

        const newPassword = await studentControllers.securePassword(password);
        const newMentorData = await Mentor.create({
            name: name,
            email: email,
            mobile: mobile,
            password: newPassword
        });
        res.status(200).send({ success: true, msg: "Registratation completed!", Data: newMentorData });

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const mentorLogin = async (req, res) => {
    try {
        const reqBody = req.body;
        const { email, password } = reqBody;
        const mentorData = await Mentor.findOne({ email: email });
        if (mentorData) {
            const newPassword = await bcrypt.compare(password, mentorData.password);
            if (newPassword) {
                const tokenData = await admin_Controllers.Create_Token(mentorData);
                const updatedData = await Mentor.findOne({ email: email });
                res.status(200).send({ success: true, msg: "Welcome to Your Profile!", Data: updatedData, token: tokenData });
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

const createCourse = async (req, res) => {
    try {

        const authUser = req.user.userData;
        const reqBody = req.body;
        const mentorData = await Mentor.findOne({ _id: authUser.userId });
        console.log(authUser.userId);
        if (!mentorData) {
            res.status(400).send({ success: false, msg: "Your Are Not A Valid Mentor!" });
        }
        const { course_Name, course_Price, about_Content } = reqBody
        if (!course_Name || !course_Price || !about_Content)
            return res.status(400).send({ success: false, msg: "Please Fill All The Fields" });

        const courseData = await Course.findOne({ course_Name: course_Name });
        // console.log(courseDaitle);
        if (courseData)
            return res.status(400).send({ success: false, msg: "This Course is already exists!" });

        await Course.create({
            courseMentor_id: mentorData._id,
            course_Name: course_Name,
            course_Price: course_Price,
            about_Content: about_Content
        });
        const courseDaitle = await Course.findOne({ courseMentor_id: authUser.userId });
        await sendMail(mentorData.name, mentorData.email, course_Name);
        res.status(200).send({ success: true, msg: "Your Course Is uploaded!", data: courseDaitle });


    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

module.exports = {
    registrataiton,
    mentorLogin,
    createCourse
}