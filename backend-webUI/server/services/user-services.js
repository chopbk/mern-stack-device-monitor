/**
 * @file include some user services
 * @author tamnd12
 * @date 23/10/2019
 */
'use strict';
const { Sequelize, User, UserInfo } = require('../models/mysql-connector');
const validator = require('validator');
const { to, ThrowErr} = require('./util-services');

/**
 * @Description This function return key from body
 * @param {Object} body : req body will include email or phone, password
 * @return {string} key : unique key
 */
const getKeyFromBody = (body) => {
    let key;
    if (typeof body.email != 'undefined') {
        key = body.email;
    } else if (typeof body.phone != 'undefined') {
        key = body.phone;
    } else {
        key = null;
    }
    return key;
}
/**
 * @Description This function will check email exist in DB
 * @param {string} email : email want to check
 * @return {boolean} res : result
 */
const isEmailExistInDB = async (email) => {
    let user, err;
    [err, user] = await to(User.findOne({
        where: {
            email: email
        }
    }));
    if (!user) {
        return false;
    }
    return true;
}
/**
 * @Description This function will check phone number exist in DB
 * @param {string} phone : phone number want to check
 * @return {boolean} res : result
 */
const isPhoneExistInDB = async (phone) => {
    let user, err;
    [err, user] = await to(User.findOne({
        where: {
            phone: phone
        }
    }));
    if(!user) {
        return false;
    }
    return true;
}
/**
 * @Description This function will authenticate UserInfo and return user on DB if ok.
 * @param {Object} UserInfo : req body will include email or phone, password
 * @return {Object} user : authen user from Database if true
 */
const authUser = async (userInfo) => {
    let auth_info = {},
        unique_key;
    auth_info.status = 'login';
    unique_key = getKeyFromBody(userInfo);
    let user, err;
    [err, user] = await to(User.findOne({
        where: {
            [Sequelize.Op.or]: [{
                email: unique_key
            }, {
                phone: unique_key
            }]
        }
    }));
    if (err) ThrowErr(err.message); // we have prolem with DB

    if (!user) ThrowErr('Not registered');
    //Call function to check password
    [err, user] = await to(user.comparePassword(userInfo.password));
    if (err) ThrowErr(err.message);
    return user; //Return user info
}

/**
 * @Description This function will validator UserInfo and return insert a User into DB if ok
 * @param {Object} UserInfo : req body will include email , phone, password and userinfo....
 * @return {Object} user : authen user from Database if true
 */
const createUser = async (authInfo, userInfo) => {
    let err, user, info, isExist;
    if (typeof authInfo.email != 'undefined') {
        [err, isExist] = await to(isEmailExistInDB(authInfo.email));
        if (isExist === true) {
            ThrowErr('Email has already used');
        }
    } else if (typeof authInfo.phone != 'undefined') {
        [err, isExist] = await to(isPhoneExistInDB(authInfo.phone));
        if (isExist === true) {
            ThrowErr('Phone has already used');
        }        
    }

    //Create auth info with email, phone, password
    [err, user] = await to(User.create(authInfo));
    if (err) {
        ThrowErr('Sorry, We have some problems with create new user');
    }
    [err, info] = await to(UserInfo.create(userInfo));
    if (err) {
        ThrowErr('Sorry, We have some problems with create new user');
    }
    user.userInfoId = info.get().id;
    [err, user] = await to(user.save());
    if (err) {
        console.log(err);
    }
    return {
        user,
        info
    };
}

/**
 * @Description This function will get user info from auth user
 * @param {Object} user : user models after use passport middleware function
 * @return {Object} userInfo : user info from DB
 */
const getUserInfo = async (user) => {
    let err, info;
    [err, info] = await to(user.getInfo());
    if (err) {
        ThrowErr(err.message);
    }
    return info;
}
/**
 * @Description This function will update user info from auth user
 * @param {Object} user : user models after use passport middleware function
 * @return {Object} userInfo : new user info from DB
 */
const updateUser = async (user, authInfo, userInfo) => {
    let err, info,isExist;
    if (typeof authInfo.email != 'undefined') {
        [err, isExist] = await to(isEmailExistInDB(authInfo.email));
        if (isExist === true) {
            ThrowErr('Email has already used');
        }
    } 
    if (typeof authInfo.phone != 'undefined') {
        [err, isExist] = await to(isPhoneExistInDB(authInfo.phone));
        if (isExist === true) {
            ThrowErr('Phone has already used');
        }        
    }
    if (typeof authInfo != 'undefined') {
        user.set(authInfo);
    }
    [err, user] = await to(user.save());
    if (err) {
        if (err.message == 'Validation error')
            ThrowErr('The email address or phone number is already in use');
    }
    //Get user info from user
    [err, info] = await to(user.getInfo());
    if (typeof userInfo != 'undefined') {
        info.set(userInfo);
    }
    if (err) {
        ThrowErr(err.message);
    }
    [err, info] = await to(info.save());
    if (err) {
        ThrowErr(err.message)
    }
    return {
        user,
        info
    };
}

//Export module
module.exports.authUser = authUser;
module.exports.createUser = createUser;
module.exports.getUserInfo = getUserInfo;
module.exports.updateUser = updateUser;