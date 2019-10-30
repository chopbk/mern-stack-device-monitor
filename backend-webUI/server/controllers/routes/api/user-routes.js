/**
 * @file route user api
 * @author tamnd12
 * @date 24/10/2019
 */
'use strict';
var express = require('express');
var router = express.Router();
const UserController = require('../../user-controllers');
const ValidatorData = require('../../../middleware/validator-data');
/* User Login API. */
router.route('/login')
    .get(UserController.getLogin)
    .post(ValidatorData.validateLoginData, UserController.postLogin);
/* User Login Google API. */
router.route('/login/google')
    .get((req,res,next) => {
        res.send('Not development yet!');
    });
/* User Signup API. */
router.route('/signup')
    .get(UserController.getSignup)
    .post(ValidatorData.validateSignupData,UserController.postSignup);

module.exports = router;