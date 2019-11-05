const { ExtractJwt, Strategy } = require('passport-jwt');
const { User }      = require('../models/users/mysql-connector');
const CONFIG        = require('../config/server-config');
const {to}          = require('../services/util-services');

const passportJWT = async (passport) => {
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = CONFIG.jwt_encryption;
    passport.use(new Strategy(opts, async function (jwt_payload, done) {
        let err, user;
        [err, user] = await to(User.findByPk(jwt_payload.user_id));
        if (err) return done(err, false);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    }));
}
module.exports.passportJWT = passportJWT;