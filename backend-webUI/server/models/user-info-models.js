/**
 * @file include some function interact User Info Table in DB
 * @author tamnd12
 * @date 22/10/2019
 */
'use strict';
const {ThrowErr, to}          = require('../services/util-services');  

//Define user info
module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('UserInfo', {
        firstName     : DataTypes.STRING,
        lastName     : DataTypes.STRING,
        address  : DataTypes.STRING,
        dateOfBirth : DataTypes.DATE,
        sex : DataTypes.ENUM('male', 'female', 'other')
    });
    Model.associate= function(models){
        this.Users = this.belongsToMany(models.User, {through: 'UserLink'});
    };
    Model.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    return Model;
};