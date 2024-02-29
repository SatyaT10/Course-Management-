const express = require('express');
const mentor_Routes = express();
const {verifyToken} = require('../middleware/auth');
const mentor_Controllers = require('../controllers/mentorControllers');

mentor_Routes.use(express.json());
mentor_Routes.use(express.urlencoded({ extended: true }));

mentor_Routes.post('/mentor-registration', mentor_Controllers.registrataiton);

mentor_Routes.post('/mentor-login', mentor_Controllers.mentorLogin);

mentor_Routes.post('/create-course', verifyToken, mentor_Controllers.createCourse);

module.exports = mentor_Routes;