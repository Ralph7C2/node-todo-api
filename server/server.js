require('dotenv').load();
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var jwt = require('jwt-simple');

var {mongoose} = require('./config/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var myAuth = require('./auth/myAuth');

var port = process.env.PORT || 3001;

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use((req, res, next) => {
	console.log(req.socket);
});

app.post('/signup', (req, res) => {
	if(!req.body.name || ! req.body.password) {
		res.json({success: false, msg: 'Please pass name and password'});
	} else {
		var newUser = new User({
			username: req.body.name,
			password: req.body.password
		});
		console.log(newUser);
		console.log("Saving user");
		newUser.save((err) => {
			if(err) {
				return res.json({success: false, msg: 'Username already exists', err: err});
			}
			res.json({success: true, msg: 'Successfully created new user'});
		});
	}
});

app.post('/authenticate', (req, res) => {
	User.findOne({
		username: req.body.name
	}, (err, user) => {
		if(err) throw err;
		if(!user) {
			res.json({success: false, msg: 'Authentication failed'});
		} else {
			user.comparePassword(req.body.password, (err, isMatch) => {
				if(isMatch && !err) {
					var token = jwt.encode(user, process.env.jwtKey);
					res.json({success: true, token: token});
				} else {
					res.json({success: false, msg: 'Authentication failed'});
				}
			});
		}
	});
});

app.get('/todos', myAuth, (req, res) => {
	Todo.find({userId: req.user._id}).then((todos) => {
		res.send({todos: todos, user: req.user});
	}, (e) => {
		res.status(400).send(e);
	});
});

app.post('/todos', myAuth, (req, res) => {
	if(!req.user) {
		console.log('Got through myAuth without user');
		res.status(403).json({success: false, msg: 'Not Authorized'});
	}
	console.log('Past auth stuff in post /todos');
	console.log(req.user._id);
	var todo = new Todo({
		text: req.body.text,
		userId: req.user._id
	});
	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});


app.listen(port, () => {
	console.log(`Started on port ${port}`);
});

module.exports = {app};