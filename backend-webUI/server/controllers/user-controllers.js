/**
 * @file controller user api
 * @author tamnd12
 * @date 24/10/2019
 */
'use strict';
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
    let err, user;
    // call authen services
    console.log('authInfo');
    console.log(req.body);
    [err, user] = await to(UserServices.authUser(req.authInfo));
    if (err) {
        return ResErr(res, err, 422);
    }
    // login sucess, response success and create jwt
    return ResSuccess(res, {
        token: user.getJWT(),
        user: user.toWeb()
    });
}

/**
 * @Description This function handle GET request for signup API
 * @param {Object} req, res, next : request, response, next middleware function
 * @return {}  : 
 */
const getSignup = async (req, res, next) => {
    res.render('signup.ejs', {
        message: '',
        title: 'Đăng ký'
    });
   
};

/**
 * @Description This function handle POST request for signup API
 * @param {Object} req, res, next : request, response, next middleware function
 * @return {}  : 
 */
const postSignup = async (req, res) => {
    let err, user;
    [err, user] = await to(UserServices.createUser(req.authInfo, req.userInfo));

    if (err) return ResErr(res, err, 422);
    return ResSuccess(res, {
        message: 'Successfully created new user.',
        user: user.user.toWeb(),
        info: user.info.toWeb(),
    }, 201);
}
//Export module
//Login controller modules
module.exports.getLogin = getLogin;
module.exports.postLogin = postLogin;

//Sigup controller modules
module.exports.getSignup = getSignup;
module.exports.postSignup = postSignup;