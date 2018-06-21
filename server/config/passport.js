var {Strategy, ExtractJwt} = require('passport-jwt');

var {User} = require('./../models/user');

module.exports = function(passport) {
	var opts = {
		secretOrKey: process.env.jwtKey, //Move to config
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
	};
	passport.use(new Strategy(opts, function(jwt_payload, done) {
		console.log('In passport middleware');
		console.log(jwt_payload);
		User.findOne({id: jwt_payload.id}, (err, user) => {
			if(err) {
				return done(err, false);
			}
			if(user) {
				done(null, user);
			} else {
				done(null, false);
			}
		});
	}));
};