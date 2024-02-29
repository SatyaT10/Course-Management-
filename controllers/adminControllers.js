const Admin = require('../models/adminModel');
const securePassword = require('../controllers/studentControllers')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const random_String = require('randomstring');
const fs = require('fs');
const { log } = require('console');


const Create_Token = async (data) => {
    try {
        const userData = {
            userId: data._id,
            email: data.email
        }
        log("UserId", userData)
        const token = jwt.sign({userData}, config.secret_jwt, { expiresIn: "2h" });
        return token;
    } catch (error) {
        log(error.message);
    }
}

const adminRegistration = async (req, res) => {
    try {
        const reqBody = req.body;
        const { name, email, password, mobile, is_admin } = reqBody;
        if (!name || !email || !password || !mobile || !is_admin) 
            return res.status(400).send({ success: false, msg: "Please Fill all the Required Fileds" });

        const adminData = await Admin.findOne({ email: email });
        if (adminData) 
            return res.status(400).send({ success: false, msg: "This Admin is allready Exits!" });
        
        const newPassword = await securePassword.securePassword(password);
        Admin.create({
            name: name,
            email: email,
            password: newPassword,
            mobile: mobile,
            is_admin: is_admin
        });

        res.status(200).send({ success: true, msg: "Admin Registration  Successfully! Completed" });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const loginAdmin = async (req, res) => {
    try {
        const reqBody = req.body;
        const { email, password } = reqBody;
        const adminData = await Admin.findOne({ email: email });
        if (adminData) {
            const passwordMatch = await bcrypt.compare(password, adminData.password);
            if (passwordMatch) {
                if (adminData.is_admin == 1) {
                    const tokenData =await Create_Token(adminData._id);
                    const updatedData = await Admin.findOne({ email: email });
                    res.status(200).send({ success: true, msg: "Welcome", data: updatedData,Token:tokenData });
                } else {
                    res.status(400).send({ success: false, msg: "You are Not a Admin" });
                }
            } else {
                res.status(400).send({ success: false, msg: "Email Or Password is Wrong!" });

            }
        } else {
            res.status(400).send({ success: false, msg: "Email Or Password is Wrong!" });

        }

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const Renew_Token = async (id) => {
    try {
        const secret_jwt = config.secret_jwt;
        const newSecret_jwt = random_String.generate();
        fs.readFile('config/config.js', 'utf-8', function (err, data) {
            if (err) throw err
            var newValue = data.replace(new RegExp(secret_jwt, 'g'), newSecret_jwt);
            log(newValue);
            fs.writeFile('config/config.js', 'utf-8', function (err, data) {
                if (err) throw err;
                log("Working Now", data);
            })
        });
        const token = await jwt.sign({ _id: id }, config.secret_jwt, { expiresIn: "22h" });
        return token

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const refreshToken = async (req, res) => {
    try {
        const reqBody = req.body;
        const { admin_id } = reqBody;
        const userData = await Admin.findOne({ _id: admin_id });
        if (userData) {
            const tokenData = await Renew_Token(admin_id);
            await Admin.updateOne({ _id: admin_id }, { $set: { refreshToken: tokenData } });
            const updatedData = { admin_id, tokenData };
            const response = {
                success: true,
                msg: "Token has refrash Successfull!",
                data: updatedData
            }
            res.status(200).send(response);
        } else {
            res.status(400).send({ success: false, msg: "Admin Id Unavilablie!" });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

module.exports = {
    adminRegistration,
    loginAdmin,
    refreshToken,
    Create_Token
}