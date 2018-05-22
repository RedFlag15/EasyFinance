/*URLS Action endpoints
	www.easyf.co/										[get]	:Done
				about/  								[get]	:Done
	 			users/ 									[redirect] :Done
		  			login/								[get, post]:Done
					signup/								[get, post]
					dashboard/							[get, post]
							 profile/ 					[get, post, delete]
							 	settings				[get, post]
							 accounts/					[get, post, delete, put]
		  	          	     	savings					[get, post, delete, put]
							 	current					[get, post, delete, put]
							 	loan					[get, post, delete, put]
							 analitics/					[get]
							 investments/				[get, post]
							 budgets/					[get, post]
							 cryptomoney/				[get, post]
*/
const mysql = require("mysql");
const crypto = require("crypto");
const async = require("async");
const nodemailer = require("nodemailer");

const dbconfig = require("../config/database");
const connection = mysql.createConnection(dbconfig.connection);
connection.query("USE " + dbconfig.database);
//connection.query("USE " + dbconfig.database);
module.exports = function(app, passport) {
	// =====================================
	// SECTION:HOME PAGE, LANDING
	// =====================================
	app.get("/", function(req, res) {
		res.render("index"); // load the index.ejs file
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
		res.render("./user/dashboard/addaccount", {
			//add more logic here!
			user: req.user, // get the user out of session and pass to template
			title: "Add an Account"
		});
	});

	app.post("/users/dashboard/add_account", isLoggedIn, function(req, res) {
		//req ! ademas insert into las bases datos
		//console.log(req);
		var data = {
			account_number: req.body.account_number,
			date: req.body.dateaccount
		};

		if (req.body.selectpicker === "Savings") data.account_type = "saving";
		else if (req.body.selectpicker === "Credit")
			data.account_type = "credit";
		else data.account_type = "current";
		data.bank = req.body.selectbank; //Valor del id del banco
		var insertQuery =
			"INSERT INTO account (id_bank, id, id_currency, number_acc, state_acc, type_acc, dateExp_acc) VALUES (?,?,?,?,?,?,?)";
		connection.query(
			insertQuery,
			[
				data.bank,
				req.user.id,
				1,
				data.account_number,
				true,
				data.account_type,
				data.date
			],
			function(err, rows) {
				if (err) {
					console.log("Wrong Insert Buuuuuuuuuu");
					throw err;
				}

				data.id = rows.insertId;
				res.render("./user/dashboard/addaccount", {
					//add more logic here!
					user: req.user, // get the user out of session and pass to template
					title: "Done,Account Added!"
				});
			}
		);
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
		res.json("Okay, route implemented");
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
	// SECTION:PROFILE
	// =====================================
	app.get("/users/profile", isLoggedIn, function(req, res) {
		res.render("./user/profile", {
			user: req.user // get the user out of session and pass to template
		});
	});
	// =====================================
	// SECTION:TERMS
	// =====================================
	app.get("/users/profile", isLoggedIn, function(req, res) {
		res.render("./user/profile", {
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
