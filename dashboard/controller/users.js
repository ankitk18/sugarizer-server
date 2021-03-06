// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../helper/common'),
	xocolors = require('../helper/xocolors')();

// main landing page
exports.index = function(req, res) {

	//query
	var query = {
		sort: '+name'
	};

	//get query params
	if (req.query.username != '') {
		query['q'] = req.query.username;
	}
	if (req.query.role != '') {
		query['role'] = req.query.role;
	}
	if (req.query.limit != '') {
		query['limit'] = req.query.limit;
	}
	if (req.query.offset != '') {
		query['offset'] = req.query.offset;
	}

	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: query,
		uri: common.getAPIUrl(req) + 'api/v1/users'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			// send to activities page
			res.render('users', {
				module: 'users',
				moment: moment,
				query: query,
				data: body,
				account: req.session.user
			});

		} else {
			req.flash('errors', {
				msg: body.message
			});
		}
	});
};

exports.addUser = function(req, res) {

	if (req.method == 'POST') {

		// validate
		req.body.name = req.body.name.trim();
		req.body.password = req.body.password.trim();
		req.assert('name', 'Name should be alphanumeric').isAlphanumeric();
		req.assert('password', 'Password should have 6 to 20 characters').len(6, 20);

		// get errors
		var errors = req.validationErrors();

		// call
		if (!errors) {
			request({
				headers: common.getHeaders(req),
				json: true,
				method: 'post',
				body: {
					user: JSON.stringify(req.body)
				},
				uri: common.getAPIUrl(req) + 'api/v1/users'
			}, function(error, response, body) {
				if (response.statusCode == 200) {

					// send to users page
					req.flash('success', {
						msg: 'User has been successfully created!'
					});
					return res.redirect('/dashboard/users/edit/' + body._id);
				} else {
					req.flash('errors', {
						msg: body.error
					});
					return res.redirect('/dashboard/users/add');
				}
			});
		} else {
			req.flash('errors', errors);
			return res.redirect('/dashboard/users/add');
		}

	} else {
		// send to activities page
		res.render('addEditUser', {
			module: 'users',
			xocolors: xocolors,
			moment: moment,
			account: req.session.user
		});
	}
};

exports.editUser = function(req, res) {

	if (req.params.uid) {
		if (req.method == 'POST') {

			// validate
			req.body.name = req.body.name.trim();
			req.body.password = req.body.password.trim();
			req.assert('name', 'Name should be alphanumeric').isAlphanumeric();
			req.assert('password', 'Password should have 6 to 20 characters').len(6, 20);

			// get errors
			var errors = req.validationErrors();

			if (!errors) {
				request({
					headers: common.getHeaders(req),
					json: true,
					method: 'put',
					body: {
						user: JSON.stringify(req.body)
					},
					uri: common.getAPIUrl(req) + 'api/v1/users/' + req.params.uid
				}, function(error, response, body) {
					if (response.statusCode == 200) {

						// send back
						req.flash('success', {
							msg: 'User has been successfully updated!'
						});
						return res.redirect('/dashboard/users/edit/' + req.params.uid);
					} else {
						req.flash('errors', {
							msg: body.error
						});
						return res.redirect('/dashboard/users/edit/' + req.params.uid);
					}
				});
			} else {
				req.flash('errors', errors);
				return res.redirect('/dashboard/users/edit/' + req.params.uid);
			}
		} else {
			request({
				headers: common.getHeaders(req),
				json: true,
				method: 'get',
				uri: common.getAPIUrl(req) + 'api/v1/users/' + req.params.uid
			}, function(error, response, body) {
				if (response.statusCode == 200) {

					// send to users page
					res.render('addEditUser', {
						module: 'users',
						user: body,
						moment: moment,
						xocolors: xocolors,
						account: req.session.user
					});
				} else {
					req.flash('errors', {
						msg: body.error
					});
					return res.redirect('/dashboard/users');
				}
			});
		}
	} else {
		req.flash('errors', {
			msg: 'There is some error!'
		});
		return res.redirect('/dashboard/users');
	}
};

exports.deleteUser = function(req, res) {

	if (req.params.uid) {
		request({
			headers: common.getHeaders(req),
			json: true,
			method: 'delete',
			uri: common.getAPIUrl(req) + 'api/v1/users/' + req.params.uid
		}, function(error, response, body) {
			if (response.statusCode == 200) {

				// send to users page
				req.flash('success', {
					msg: 'User has been successfully deleted!'
				});
			} else {
				req.flash('errors', {
					msg: body.error
				});
			}
			return res.redirect('/dashboard/users');
		});
	} else {
		req.flash('errors', {
			msg: 'There is some error!'
		});
		return res.redirect('/dashboard/users');
	}
};
