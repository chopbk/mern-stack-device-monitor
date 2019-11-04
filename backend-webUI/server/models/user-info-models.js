/**
 * @file include some function interact User Info Table in DB
 * @author tamnd12
 * @date 22/10/2019
 */
'use strict';
const {ThrowErr, to}          = require('../services/util-services'); 

/**
 * @Description export function to interact with User Info Table in DB 
 */
module.exports = (sequelize, DataTypes) => {
    var Info = sequelize.define('UserInfo', {
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        address: DataTypes.STRING,
        dateOfBirth: DataTypes.DATE,
        gender: DataTypes.ENUM('male', 'female', 'other')
    });

    Info.associate = function (models) {
        //this.Users = Model.hasOne(models.User)
    };
    Info.prototype.toWeb = function () {
        let json = this.toJSON();
        return json;
    };

    return Info;
};