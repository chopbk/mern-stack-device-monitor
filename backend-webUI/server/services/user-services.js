/**
 * @file include some user services
 * @author tamnd12
 * @date 23/10/2019
 */
'use strict';
const { User } = require('../models/mysql-connector');
const validator = require('validator');
const { to, ThrowErr} = require('./util-services');

/**
 * @Des This function return key from body
 * @param {Object} body : req body will include email or phone, password
 * @return {} key : unique key
 */
const getKeyFromBody = (body) => {
    let key = body.unique_key;
    if (typeof key === 'undefined') {
        if (typeof body.email != 'undefined') {
            key = body.email;
        } else if (typeof body.phone != 'undefined') {
            key = body.phone;
        } else {
            key = null;
        }
    }
    return key;
}
/**
 * @Des This function will authenticate UserInfo and return user on DB if ok.
 * @param {Object} UserInfo : req body will include email or phone, password
 * @return {Object} user : authen user from Database if true
 */
const authUser = async (userInfo) => {
    let unique_key;
    let auth_info = {};
    auth_info.status = 'login';
    unique_key = getKeyFromBody(userInfo);
    console.log(userInfo);
    //Check Email or Phone
    if (!unique_key) ThrowErr('Please enter an email or phone number to login');
    //Check password has fill?
    if (!userInfo.password) ThrowErr('Please enter a password to login');
    //Check user use email or phone 
    let user, err;
    if (validator.isEmail(unique_key)) {
        auth_info.method = 'email';

        [err, user] = await to(User.findOne({
            where: {
                email: unique_key
            }
        }));
        if (err) ThrowErr(err.message); //If email not found in Db
        
    } else if (validator.isMobilePhone(unique_key, 'any')) {
        [err, user] = await to(User.findOne({
            where: {
                email: unique_key
            }
        }));
        if (err) ThrowErr(err.message); //If mobile phone not found in Db
    } else {
        ThrowErr('A valid email or phone number was not entered');
    }
    if (!user) ThrowErr('Not registered');
    //Call function to check password
    [err, user] = await to(user.comparePassword(userInfo.password));
    if (err) ThrowErr(err.message);
    return user; //Return user info
}
module.exports.authUser = authUser;