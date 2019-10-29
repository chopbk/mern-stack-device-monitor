/**
 * @file parse data from route
 * @author tamnd12
 * @date 27/10/2019
 */
'use strict';
const validator = require('validator');
const { ResErr } = require('./../services/util-services');

/**
 * @Description This function will check a variable and return true if ok.
 * @param {var} variable : variable want to check
 * @return {boolean} 
 */
const isDataValid = (variable) => {
    if (typeof variable === 'undefined' || variable === null ||
        (typeof variable === 'string' && !variable))
        return false;
    else
        return true;
}
/**
 * @Description This function will validator Login User Info and return true if ok.
  * @param {Object} (req, res, next) : req body will include email or phone, password
 * @return {Object} response error or add User Info to req 
 */
const validateLoginData = (req, res, next) => {
    let authInfo = {};
    if (isDataValid(req.body.email)) {
        if (validator.isEmail(req.body.email)) {
            authInfo.email = req.body.email;
        } else if (validator.isMobilePhone(req.body.email)) {
            authInfo.phone = req.body.email;
        } else return ResErr(res, 'Please enter a valid email or phone');
    } else {
        return ResErr(res, 'Please enter an email or phone number to login');
    }
    //Check password
    if (isDataValid(req.body.password)) {
        authInfo.password = req.body.password;
    } else {
        return ResErr(res, 'Please enter password to login');
    }
    req.authInfo = authInfo;

    next();
};
/**
 * @Description This function will validator Signup User Info and return true if ok.
 * @param {Object} (req, res, next) : req body will include email, phone, password and user info
 * @return {Object} response error or add User Info to req 
 */
const validateSignupData = (req, res, next) => {
    console.log('validateSignupData');
    let userInfo = {};
    let authInfo = {};
    //valid email
    if (isDataValid(req.body.email)) {
        if (validator.isEmail(req.body.email)) {
            authInfo.email = req.body.email;
        } else {
            return ResErr(res, 'Please enter a valid email');
        }
        //need to check phone field if api have two options
        if (isDataValid(req.body.phone)) {
            if (validator.isMobilePhone(req.body.phone)) {
                authInfo.phone = req.body.phone;
            } else {
                return ResErr(res, 'Please enter a valid phone number');
            }
        }
    } else if (isDataValid(req.body.phone)) {
        if (validator.isMobilePhone(req.body.phone)) {
            authInfo.phone = req.body.phone;
        } else {
            return ResErr(res, 'Please enter a valid phone number');
        }
    } else {
        return ResErr(res, 'Enter Email/Phone number');
    }
    //valid password
    if (isDataValid(req.body.password)) {
        //Check retype - password
        if (isDataValid(req.body.repassword)) {
            if (!(req.body.password === req.body.repassword))
                return ResErr(res, 'Password not equal');
        } else {
            return ResErr(res, 'Please enter retype password');
        }
        authInfo.password = req.body.password;
    } else {
        return ResErr(res, 'Please enter password');
    }
    //valid name
    if (isDataValid(req.body.lastName) || isDataValid(req.body.firstName)) {
        userInfo.lastName = req.body.lastName;
        userInfo.firstName = req.body.firstName;
    } else {
        return ResErr(res, 'Please enter your name');
    }
    //add address and gender 
    if (req.body.address) {
        userInfo.address = req.body.address;
    }
    if (req.body.gender) {
        userInfo.gender = req.body.gender;
    }
    req.userInfo = userInfo;
    req.authInfo = authInfo;
    next();
};
//export 
module.exports.validateSignupData = validateSignupData;
module.exports.validateLoginData = validateLoginData;