/**
 * @file include some function interact Authentication User Database
 * @author tamnd12
 * @date 22/10/2019
 */

'use strict';
const bcrypt 			= require('bcrypt');
const bcrypt_p 			= require('bcrypt-promise');
const jwt           	= require('jsonwebtoken');
const {ThrowErr, to}    = require('../services/util-services');
const CONFIG            = require('../config/server-config');

/**
 * @Description export function to interact with User Authentication Table in DB 
 */
module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                isEmail: {
                    msg: "Email invalid."
                }
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                len: {
                    args: [7, 20],
                    msg: "Phone number invalid, too short."
                },
                isNumeric: {
                    msg: "not a valid phone number."
                }
            }
        },
        password: DataTypes.STRING,
        userInfoId: DataTypes.INTEGER, //foreign keys of User Info
    }); // If don't want auto add timestamp attributes, add timestamps : false
    User.associate = function (models) {
        User.belongsTo(models.UserInfo, {
            foreignKey: 'userInfoId',
            as: 'info'
        })
    };

    //Encrypt password 
    User.beforeSave(async function (user, options) {
        let err;
        if (user.changed('password')) {
            let salt, hash;
            [err, salt] = await to(bcrypt.genSalt(10));
            if (err) ThrowErr(err.message, true);
            //encrypt password use brcypt
            [err, hash] = await to(bcrypt.hash(user.password, salt));
            if (err) ThrowErr(err.message, true);

            user.password = hash;
        }
    });
    //Compare password with password in DB
    User.prototype.comparePassword = async function (pw) {
        let err, pass
        if (!this.password) ThrowErr('password not set');

        [err, pass] = await to(bcrypt_p.compare(pw, this.password));
        if (err) ThrowErr(err);

        if (!pass) ThrowErr('invalid password');

        return this;
    }
    //Get new Json Web Token for Authentication
    User.prototype.getJWT = function () {
        let expiration_time = parseInt(CONFIG.jwt_expiration);
        return "Bearer " + jwt.sign({
            user_id: this.id
        }, CONFIG.jwt_encryption, {
            expiresIn: expiration_time
        });
    };
    //Convert this User Authen Object to Json
    User.prototype.toWeb = function () {
        let json = this.toJSON();
        delete json.password;
        return json;
    };
    return User;
};