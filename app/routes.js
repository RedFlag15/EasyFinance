const mysql = require("mysql");
const request = require("request");
const crypto = require("crypto");
const async = require("async");
const nodemailer = require("nodemailer");
const dbconfig = require("../config/database");
const connection = mysql.createConnection(dbconfig.connection);
connection.query("USE " + dbconfig.database);
module.exports = function(app, passport) {
	// EASYFINANCE.CO APPLICATION, UTP 2018.
	// easyfinance.co@gmail.com

	// =====================================
	// SECTION:HOME PAGE, LANDING
	// =====================================
	app.get("/", function(req, res) {
		res.render("index"); // load the index.ejs file
	});

	app.get("/users/", function(req, res) {
		res.redirect("/users/login");
	});
	// =====================================
	// SECTION:LOGIN
	// =====================================
	app.get("/users/login", function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render("./user/login", {
			message: req.flash("loginMessage")
		});
	});

	app.post(
		"/users/login",
		passport.authenticate("local-login", {
			successRedirect: "/users/dashboard", // redirect to the secure profile section
			failureRedirect: "/users/login", // redirect back to the signup page if there is an error
			failureFlash: true // allow flash messages
		})
	);

	// =====================================
	// SECTION:SIGNUP
	// =====================================
	app.get("/users/signup", function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render("./user/signup", {
			message: req.flash("signupMessage")
		});
	});

	// process the signup form
	app.post(
		"/users/signup",
		passport.authenticate("local-signup", {
			successRedirect: "/users/login", // redirect to the secure profile section
			failureRedirect: "/users/signup", // redirect back to the signup page if there is an error
			failureFlash: true // allow flash messages
		})
	);

	// =====================================
	// SECTION:DASHBOARD SECTION
	// =====================================
	app.get("/users/dashboard", isLoggedIn, function(req, res) {
		//carga parcial de datos de usuario balances, foto de perfil....etc
		res.render("./user/dashboard/main", {
			//add more logic here!
			user: req.user // get the user out of session and pass to template
		});
	});

	app.get("/users/dashboard/account", isLoggedIn, function(req, res) {
		res.render("./user/dashboard/", {
			//add more logic here!
			user: req.user // get the user out of session and pass to template
		});
	});

	app.get("/users/dashboard/add_account", isLoggedIn, function(req, res) {
		res.render("./user/dashboard/addbank", {
			//add more logic here!
			user: req.user, // get the user out of session and pass to template
			title: "Add an Account"
		});
	});

	app.post("/users/dashboard/sync_bank", isLoggedIn, function(req, res) {
		console.log("Cool you're sending post");
		console.log(req.body);
		request(
			{
				method: "GET",
				uri: "https://apibank.herokuapp.com/account/98765/BBVA/8888"
			},
			function(error, response, body) {
				// body is the decompressed response bod
				console.log("the decoded data is: " + response);
			}
		);

		/*
		request.post(
			"https://apibank.herokuapp.com/user",
			{ json: { id: "value" } },
			function(error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log(body);
				}
			}
		);
		*/
	});

	app.get("/users/dashboard/accounts/credit", isLoggedIn, function(req, res) {
		//obtenemos datos asociados al usuario, solo cuentas de credito.
		//bank.id_bank:int, user.id : int, account
		data = {};
		var selectQuery =
			"SELECT name_bank, number_acc FROM account, bank, user WHERE account.id=? AND account.id_bank=bank.id_bank AND user.id=account.id AND account.type_acc=?;";
		connection.query(selectQuery, [req.user.id, "credit"], function(
			err,
			rows
		) {
			if (err) {
				console.log("Wrong Query in Credit Database");
				throw err;
			}
			data.id = rows;
			//console.log(rows);

			res.render("./user/dashboard/credit", {
				//add more logic here!
				user: req.user, // get the user out of session and pass to template
				title: "Credit Accounts"
			});
		});
	});

	app.get("/users/dashboard/accounts/current", isLoggedIn, function(
		req,
		res
	) {
		//obtenemos datos asociados al usuario, solo cuentas de credito.
		//bank.id_bank:int, user.id : int, account
		data = {};
		var selectQuery =
			"SELECT name_bank, number_acc FROM account, bank, user WHERE account.id=? AND account.id_bank=bank.id_bank AND user.id=account.id AND account.type_acc=?;";
		connection.query(selectQuery, [req.user.id, "current"], function(
			err,
			rows
		) {
			if (err) {
				console.log("Wrong Query in Saving Database");
				throw err;
			}
			data.id = rows;
			//console.log(rows);

			res.render("./user/dashboard/credit", {
				//add more logic here!
				user: req.user, // get the user out of session and pass to template
				title: "Credit Accounts"
			});
		});
	});

	app.get("/users/dashboard/accounts/savings", isLoggedIn, function(
		req,
		res
	) {
		//obtenemos datos asociados al usuario, solo cuentas de credito.
		//bank.id_bank:int, user.id : int, account
		data = {};
		var selectQuery =
			"SELECT name_bank, number_acc FROM account, bank, user WHERE account.id=? AND account.id_bank=bank.id_bank AND user.id=account.id AND account.type_acc=?;";
		connection.query(selectQuery, [req.user.id, "saving"], function(
			err,
			rows
		) {
			if (err) {
				console.log("Wrong Query in Saving Database");
				throw err;
			}
			data.id = rows;
			//console.log(rows);
			res.render("./user/dashboard/credit", {
				//add more logic here!
				user: req.user, // get the user out of session and pass to template
				title: "Credit Accounts"
			});
		});
	});

	app.get("/users/dashboard/accounts/current", isLoggedIn, function(
		req,
		res
	) {
		//obtenemos datos asociados al usuario, solo cuentas de credito.
		//bank.id_bank:int, user.id : int, account
		data = {};
		var selectQuery =
			"SELECT name_bank, number_acc FROM account, bank, user WHERE user.id=? AND user.id=account.id AND account.type_acc=?;";
		connection.query(selectQuery, [req.user.id, "saving"], function(
			err,
			rows
		) {
			if (err) {
				console.log("Wrong Query in Current Database");
				throw err;
			}
			data.id = rows;
			//console.log(rows);
			res.render("./user/dashboard/credit", {
				//add more logic here!
				user: req.user, // get the user out of session and pass to template
				title: "Current Accounts"
			});
		});
	});

	// =====================================
	// SECTION:PROFILE
	// =====================================
	app.get("/users/password_recovery", function(req, res) {
		res.render("./user/recover_password", {
			//add more logic here!
			user: req.user, // get the user out of session and pass to template
			title: "Password"
		});
	});

	app.post("/users/password_recovery", function(req, res) {
		res.json("Okay, route needs to be implemented");
	});

	app.post("/users/forgot", function(req, res, next) {
		console.log("Solicitud recibida de: " + req.body.email);
		async.waterfall(
			[
				function(done) {
					crypto.randomBytes(20, function(err, buf) {
						var token = buf.toString("hex");
						console.log(`Token Created: ${token}`);
						done(err, token);
					});
				},
				/*function(token, done) {
					console.log("Using the token for search");
					emailQuery = "select * from user where username=?";
					connection.query(emailQuery, ["potter@magic.co"], function(
						err,
						rows
					) {
						if (err) {
							console.log(
								"thereis no user with that Email address"
							);
							throw err;
						}
						data = rows[0];
						console.log(`Database Okay ${data}`);
					});
				},
				function(token, user, done) {*/
				function(token, done) {
					var smtpTransport = nodemailer.createTransport(
						"smtps://easyfinance.co@gmail.com3:" +
							encodeURIComponent("karminakoala2018") +
							"@smtp.gmail.com:465"
					);
					var mailOptions = {
						to: "hfjimenez@utp.edu.co",
						from: "EasyFinance.co <easyfinance.co@gmail.com>",
						subject: "Node.js Password Reset",
						text:
							"You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
							"Please click on the following link, or paste this into your browser to complete the process:\n\n" +
							"http://" +
							req.headers.host +
							"/reset/" +
							token +
							"\n\n" +
							"If you did not request this, please ignore this email and your password will remain unchanged.\n"
					};
					smtpTransport.sendMail(mailOptions, function(err) {
						req.flash(
							"info",
							"An e-mail has been sent to " +
								"hfjimenez@utp.edu.co" +
								" with further instructions."
						);
						done(err, "done");
					});
				}
			],
			function(err) {
				if (err) return next(err);
				res.redirect("/users/forgot");
			}
		);
	});

	// =====================================
	// SECTION:BUDGETS
	// =====================================

	app.get("/users/dashboard/create_budget", isLoggedIn, function(req, res) {
		res.render("./user/dashboard/create_budget", {
			user: req.user // get the user out of session and pass to template
		});
	});
	//NO IMPLEMENTADO
	// =====================================
	// SECTION:GROUP ACCOUNTS
	// =====================================

	app.get("/users/dashboard/group_accounts", isLoggedIn, function(req, res) {
		res.render("./user/dashboard/group_accounts", {
			user: req.user // get the user out of session and pass to template
		});
	});

	//NO IMPLEMENTADO
	// =====================================
	// SECTION:GROUP ACCOUNTS  SEE
	// =====================================

	app.get("/users/dashboard/accounts/groups", isLoggedIn, function(req, res) {
		res.render("./user/dashboard/group", {
			user: req.user // get the user out of session and pass to template
		});
	});

	//NO IMPLEMENTADO
	// =====================================
	// SECTION:SHOW BUDGET
	// =====================================

	app.get("/users/dashboard/accounts/budget", isLoggedIn, function(req, res) {
		res.render("./user/dashboard/budget", {
			user: req.user // get the user out of session and pass to template
		});
	});
	//NO IMPLEMENTADO
	// =====================================
	// SECTION:SHOW GROUP
	// =====================================
	app.get("/users/dashboard/showgroup", isLoggedIn, function(req, res) {
		res.render("./user/dashboard/showgroup", {
			user: req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// SECTION:GROUP ACCOUNTS
	// =====================================

	app.get("/users/dashboard/group_accounts", isLoggedIn, function(req, res) {
		res.render("./user/dashboard/group_accounts", {
			user: req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// SECTION:PROFILE
	// =====================================
	app.get("/users/profile", isLoggedIn, function(req, res) {
		res.render("./user/dashboard/profile", {
			user: req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// SECTION:ANALITICS
	// =====================================
	app.get("/users/dashboard/analitics", isLoggedIn, function(req, res) {
		res.send("NOT IMPLEMENTED :" + req.url);
	});

	// =====================================
	// SECTION:CRIPTOMONEY
	// =====================================
	app.get("/users/dashboard/cryptomoney", isLoggedIn, function(req, res) {
		res.send("NOT IMPLEMENTED :" + req.url);
	});

	// =====================================
	// SECTION:INVESTMENTS
	// =====================================
	app.get("/users/dashboard/investments", isLoggedIn, function(req, res) {
		res.send("NOT IMPLEMENTED :" + req.url);
	});

	app.get("/dummy", function(req, res) {
		res.render("./user/terms", {
			user: req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// SECTION:TERMS
	// =====================================
	app.get("/terms", isLoggedIn, function(req, res) {
		res.render("./user/terms", {
			user: req.user // get the user out of session and pass to template
		});
	});
	// =====================================
	// SECTION:ABOUT
	// =====================================
	app.get("/about", isLoggedIn, function(req, res) {
		res.render("./user/terms", {
			user: req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// SECTION:LOGOUT
	// =====================================
	app.get("/users/logout", function(req, res) {
		req.logout();
		res.redirect("/users/login");
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()) return next();
	// if they aren't redirect them to the home page
	res.redirect("/users/login");
}
