const express = require('express');
const admin_Routes = express();
const {verifyToken}=require('../middleware/auth');

admin_Routes.use(express.json());
admin_Routes.use(express.urlencoded({ extended: true }));


const admin_Controller = require('../controllers/adminControllers');

admin_Routes.post('/admin-registration', admin_Controller.adminRegistration);

admin_Routes.post('/login',admin_Controller.loginAdmin);

admin_Routes.get('/refresh-token',verifyToken,admin_Controller.refreshToken);

module.exports = admin_Routes;
