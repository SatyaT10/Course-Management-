const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');


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
                // Worker.parentPort.eventNames(sendMail);
                console.log("Email has been sent:-", info.response);
            }
        })


    } catch (error) {
        console.log(error.message);
    }
}


const worker = new Worker('email-Queue', async (student) => {
    await sendMail(student.name, student.email, student.course_Name);
}).run();