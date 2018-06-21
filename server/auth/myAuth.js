var jwt = require('jwt-simple');

module.exports = function(req, res, next) {
	try {
		if(!req.headers.authorization) {
			return res.status(403).json({success: false, msg: 'No authorization header'});
		}
		req.user = jwt.decode(req.headers.authorization.slice(7), 'DisMyKey');
		next();
	} catch(err) {
		res.status(403).json({success: false, msg: 'Malformed token'});
	}
}