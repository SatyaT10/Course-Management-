const express = require('express');
const student_Routes = express();

const student_Controllers = require('../controllers/studentControllers');
const { verifyToken } = require('../middleware/auth');

student_Routes.use(express.json());
student_Routes.use(express.urlencoded({ extended: true }));

student_Routes.post('/enroll-course', student_Controllers.enrollCourse);

student_Routes.get('/', student_Controllers.allCourses);

student_Routes.post('/student-login', student_Controllers.studentLogin);

student_Routes.get('/mycourse', verifyToken, student_Controllers.myCourse);

student_Routes.post('/by-new-course', verifyToken, student_Controllers.byNewCourse);

module.exports = student_Routes;