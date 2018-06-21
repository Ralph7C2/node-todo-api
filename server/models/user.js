var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	username: {
		type: String,
		unique: true,
		required: true,
		minlength: 5,
		trim: true
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
		trim: true
	}
});
//Cannot use E6 arrow here...bug
UserSchema.pre('save', function(next) {
	console.log("Pre save");
	console.log(this);
	var user = this;
	console.log(user);
	if(this.isModified('password') || this.isNew) {
		console.log("Hashing pass");
		bcrypt.genSalt(10, (err, salt) => {
			if(err) {
				return next(err);
			}
			console.log("Salt created");
			bcrypt.hash(user.password, salt, (err, hash) => {
				if(err) {
					return next(err);
				}
				console.log("Setting hash");
				user.password = hash;
				next();
			});
		});
	} else {
		console.log('Saving');
		return next();
	}
});

UserSchema.methods.comparePassword = function(passwd, cb) {
	bcrypt.compare(passwd, this.password, function(err, isMatch) {
		if(err) {
			return cb(err);
		}
		cb(null, isMatch);
	});
}

var User = mongoose.model('User', UserSchema);

module.exports = {User};