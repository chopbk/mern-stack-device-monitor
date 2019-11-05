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
const passport = require('passport');
const passportMid = require('./../../../middleware/passport');
passportMid.passportJWT(passport);

/* User update API. */
router.route('/')
    .get(passport.authenticate('jwt', {session:false}), UserController.getUser)
    //Put for update user info (edit)
    .put(passport.authenticate('jwt', {session:false}),ValidatorData.validateUpdateData, UserController.putUser)
    .delete(passport.authenticate('jwt', {session:false}))//, UserController.delete)
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