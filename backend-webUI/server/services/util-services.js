/**
 * @file include some util function
 * @author tamnd12
 * @date 23/10/2019
 */
'use strict';
const { to } = require('await-to-js');
const parseErr = require('parse-error');

/**
 * @Description This function make a function to promise function 
 * @param {function} promise : function return a promise 
 * @return {} [err,res] : error and result
 */
module.exports.to = async (promise) => {
    let err, res;
    [err, res] = await to(promise);
    if (err) return [parseErr(err)];

    return [null, res];
};

/**
 * @Description This function response err to Web 
 * @param {Object} res : info to response
 * @param (error) err: err message
 * @param (number) code: err code
 * @return {Object} res : response
 */
module.exports.ResErr = function (res, err, code) { // Error Web Response
    if (typeof err == 'object' && typeof err.message != 'undefined') {
        err = err.message;
    }

    if (typeof code !== 'undefined') res.statusCode = code;

    return res.json({
        success: false,
        error: err
    });
};

/**
 * @Description This function response sucess to Web 
 * @param {Object} res : info to response
 * @param (error) err: err message
 * @param (number) code: err code
 * @return {Object} res : response
 */
module.exports.ResSuccess = function (res, data, code) { // Success Web Response
    let send_data = {
        success: true
    };

    if (typeof data == 'object') {
        send_data = Object.assign(data, send_data); //merge the objects
    }

    if (typeof code !== 'undefined') res.statusCode = code;

    return res.json(send_data)
};

/**
 * @Description This function call throw new error and log error
 * @param {string} err_message, log : error info and log option
 * @return {Object} res : response
 */
module.exports.ThrowErr = function (err_message, log) { // ThrowErr stands for Throw Error
    if (log === true) {
        console.error(err_message);
    }
    throw new Error(err_message);
};