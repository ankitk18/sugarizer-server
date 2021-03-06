// include libraries
var request = require('request'),
	common = require('../helper/common');

/**
 * GET /login
 * Login page.
 */

exports.getLogin = function(req, res) {
	if (req.session.user) {
		// send to dashboard
		return res.redirect('/dashboard');
	} else {
		// send to login page
		res.render('login', {
			title: 'Login'
		});
	}
};

/**
 * POST /login
 * Sign in using email and password.
 * @param email
 * @param password
 */

exports.postLogin = function(req, res, next) {

	// validate
	req.assert('username', 'Username is not valid').notEmpty();
	req.assert('password', 'Password cannot be blank').notEmpty();

	// get errors
	var errors = req.validationErrors();

	//form data
	var form = {
		user: JSON.stringify({
			name: req.body.username,
			password: req.body.password,
			role: 'admin'
		})
	};

	//call
	if (!errors) {
		// call
		request({
			headers: {
				"content-type": "application/json",
			},
			json: true,
			method: 'POST',
			uri: common.getAPIUrl(req) + 'auth/login',
			body: form
		}, function(error, response, body) {

			if (response.statusCode == 200) {
				//store user and key in session
				req.session.user = response.body

				// redirect to dashboard
				return res.redirect('/dashboard');
			} else {
				req.flash('errors', {
					msg: body.message
				});
				return res.redirect('/dashboard/login');
			}
		})
	} else {
		req.flash('errors', errors);
		return res.redirect('/dashboard/login');
	}
};

/**
 * GET /logout
 * Log out.
 */

exports.logout = function(req, res) {
	req.session.destroy();
	res.redirect('/dashboard/login');
};

/**
 * validate session for dashboard
 */
exports.validateSession = function(req, res, next) {
	if (!req.session.user) {
		res.redirect('/dashboard/login');
	}
	next();
};
