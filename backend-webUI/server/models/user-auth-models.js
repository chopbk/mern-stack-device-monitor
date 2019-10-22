/**
 * @file include some function interact Authentication User Database
 * @author tamnd12
 * @date 22/10/2019
 */

'use strict';
const bcrypt 			= require('bcrypt');
const bcrypt_p 			= require('bcrypt-promise');
const jwt           	= require('jsonwebtoken');
const {ThrowErr, to}          = require('../services/util-services');
const CONFIG            = require('../config/server-config');

/**
 * @Des export function to interact with User Authentication Table in DB 
  */
module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('User', {
        email     : {type: DataTypes.STRING, allowNull: true, unique: true, validate: { isEmail: {msg: "Phone number invalid."} }},
        phone     : {type: DataTypes.STRING, allowNull: true, unique: true, validate: { len: {args: [7, 20], msg: "Phone number invalid, too short."}, isNumeric: { msg: "not a valid phone number."} }},
        password  : DataTypes.STRING,
    });// If don't want auto add timestamp attributes, add timestamps : false
    // This table associate with UserInfo table
    Model.associate = function(models){
        this.UserInfos = this.belongsToMany(models.UserInfo, {through: 'UserLinkTbl'});
    };
    //encrypt password 
    Model.beforeSave(async (user, options) => {
        let err;
        if (user.changed('password')){
            let salt, hash
            [err, salt] = await to(bcrypt.genSalt(10));
            if(err) ThrowErr(err.message, true);
            //encrypt password use brcypt
            [err, hash] = await to(bcrypt.hash(user.password, salt));
            if(err) ThrowErr(err.message, true);

            user.password = hash;
        }
    });
    //Compare password with password in DB
    Model.prototype.comparePassword = async function (pw) {
        let err, pass
        if(!this.password) ThrowErr('password not set');

        [err, pass] = await to(bcrypt_p.compare(pw, this.password));
        if(err) ThrowErr(err);

        if(!pass) ThrowErr('invalid password');

        return this;
    }
    //Get new Json Web Token for Authentication
    Model.prototype.getJWT = function () {
        let expiration_time = parseInt(CONFIG.jwt_expiration);
        return "Bearer "+jwt.sign({user_id:this.id}, CONFIG.jwt_encryption, {expiresIn: expiration_time});
    };
    //Convert this User Authen Object to Json
    Model.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Model;
};
