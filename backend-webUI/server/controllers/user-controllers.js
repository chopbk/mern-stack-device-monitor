/**
 * @file controller user api
 * @author tamnd12
 * @date 24/10/2019
 */
'use strict';
const { User }          = require('../models/mysql-connector');
const { to, ResSuccess, ResErr }  = require('../services/util-services');
const UserServices   = require('../services/user-services');

/**
 * @Description This function handle GET request for login API
 * @param {Object} req, res, next : request, response, next middleware function
 * @return {}  : 
 */
const getLogin = async (req, res, next) => {
    res.render('login.ejs', {
        message: '',
        title: 'Đăng nhập'
    });
};

/**
 * @Description This function handle POST request for login API
 * @param {Object} req, res, next : request, response, next middleware function
 * @return {}  : 
 */
const postLogin = async (req, res) => {
    const body = req.body;
    let err, user;
    // call authen services

    [err, user] = await to(UserServices.authUser(req.body));
    if (err) {
        return ResErr(res, err, 422);
    }
    // login sucess, response success and create jwt
    return ResSuccess(res, {
        token: user.getJWT(),
        user: user.toWeb()
    });
}

//Export module
module.exports.getLogin = getLogin;
module.exports.postLogin = postLogin;