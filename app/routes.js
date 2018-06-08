const mysql = require("mysql");
const request = require("request");
var requests = require("sync-request"); //testing
const crypto = require("crypto");
const async = require("async");
var flash = require("express-flash");
const nodemailer = require("nodemailer");
var bcrypt = require("bcrypt-nodejs");
const dbconfig = require("../config/database");
const connection = mysql.createConnection(dbconfig.connection);
connection.query("USE " + dbconfig.database);
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
app.use(express.static(path.join(__dirname, "public")));

// =====================================
// FUNCTION HELPERS:
// =====================================
// AVOID TO SEARCH AND FIND IN THE DATABASE
function banklist(name) {
	list = {
		BANCOLOMBIA: 1,
		"BANCO AGRARIO": 2,
		"BANCO AV VILLAS": 3,
		"BANCO CAJA SOCIAL": 4,
		"BANCO COLPATRIA": 5,
		"BANCO COMPARTIR S.A.": 6,
		"BANCO COOPERATIVO COOPCENTRAL": 7,
		"BANCO DAVIVIENDA": 8,
		"BANCO DE BOGOTÁ": 9,
		"BANCO DE OCCIDENTE": 10,
		"BANCO FALABELLA S.A.": 11,
		"BANCO FINANDINA S.A.": 12,
		"BANCO GNB COLOMBIA S.A": 13,
		"BANCO GNB SUDAMERIS": 14,
		"BANCO MULTIBANK S.A": 15,
		"BANCO PICHINCHA": 16,
		"BANCO POPULAR": 17,
		"BANCO PROCREDIT": 18,
		"BANCO SANTANDER DE NEGOCIOS": 19,
		"BANCO W S.A": 20,
		BANCOOMEVA: 21,
		BBVA: 22,
		CITIBANK: 23,
		"COLTEFINANCIERA S.A.": 24,
		CONFIAR: 25
	};
	return list[name];
}

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
		//Agregar las consultas de balances, imagen de perfil
		res.render("./user/dashboard/main", {
			//add more logic here!
			user: req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// SECTION:ACCOUNT
	// =====================================
	app.get("/users/dashboard/account", isLoggedIn, function(req, res) {
		res.render("./user/dashboard/", {
			//add more logic here!
			user: req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// SECTION:ADD ACCOUNT
	// =====================================
	app.get("/users/dashboard/add_account", isLoggedIn, function(req, res) {
		res.render("./user/dashboard/addbank", {
			//add more logic here!
			user: req.user, // get the user out of session and pass to template
			title: "Add an Account"
		});
	});

	app.post("/users/dashboard/sync_bank", isLoggedIn, function(req, res) {
		var id_persona = req.body.idUser;
		var bank_name = req.body.bank;
		var pin_password = req.body.pin_password;
		console.log("* Enviado por usuario"); //debug
		console.log(req.body); //debug
		console.log("##############"); //debug
		var uribase =
			"https://apibank.herokuapp.com/account/" +
			id_persona +
			"/" +
			bank_name +
			"/" +
			pin_password;
		var resc = requests("GET", uribase);
		data = JSON.parse(resc.getBody("utf-8"), true);
		console.log(resc.getBody("utf-8")); //debug
		res.render("./user/dashboard/select_accounts", {
			title: "Sync Account",
			results: data.account
		});
	});
	app.post("/users/dashboard/account/sync_process", isLoggedIn, function(
		req,
		res
	) {
		var selectedaccount = [];
		var data = req.body;
		console.log(data); //debug
		var datalen = Object.keys(data).length;
		console.log(datalen); //debug
		for (var key in data) {
			console.log(data[key] + " is " + key); //debug
			selectedaccount = data[key].split(",");
			console.log(selectedaccount); //debug
			if (selectedaccount[2] === "credit") {
				console.log("Credit");
				insertCreditQuery =
					"INSERT INTO account (id_bank, id, id_currency, number_acc, state_acc, dateExp_acc, type_acc) VALUES (?,?,?,?,?,?,?);";
				console.log(banklist[selectedaccount[0]]); //debug
				console.log(req.user.id); //debug
				console.log(selectedaccount[1]); //debug
				console.log(selectedaccount[2]); //debug
				connection.query(
					insertCreditQuery,
					[
						banklist(selectedaccount[0]),
						req.user.id,
						1,
						selectedaccount[1],
						true,
						"10/20",
						selectedaccount[2]
					],
					function(err, rows) {
						if (err) {
							console.log(
								"Wrong Insertion in Database something went wrong"
							);
							throw err;
						}
						console.log("Insert Done"); //debug
						console.log(rows); //debug
					}
				);
			} else if (selectedaccount[2] === "saving") {
				console.log("Saving");
				insertCreditQuery =
					"INSERT INTO account (id_bank, id, id_currency, number_acc, state_acc, dateExp_acc, type_acc) VALUES (?,?,?,?,?,?,?);";
				console.log(banklist[selectedaccount[0]]); //debug
				console.log(req.user.id); //debug
				console.log(selectedaccount[1]); //debug
				console.log(selectedaccount[2]); //debug
				connection.query(
					insertCreditQuery,
					[
						banklist(selectedaccount[0]),
						req.user.id,
						1,
						selectedaccount[1],
						true,
						"10/20",
						selectedaccount[2]
					],
					function(err, rows) {
						if (err) {
							console.log(
								"Wrong Insertion in Database something went wrong"
							);
							throw err;
						}
						console.log("Insert Done"); //debug
						console.log(rows); //debug
					}
				);
			} else {
				console.log("Current");
				insertCreditQuery =
					"INSERT INTO account (id_bank, id, id_currency, number_acc, state_acc, dateExp_acc, type_acc) VALUES (?,?,?,?,?,?,?);";
				console.log(banklist[selectedaccount[0]]); //debug
				console.log(req.user.id); //debug
				console.log(selectedaccount[1]); //debug
				console.log(selectedaccount[2]); //debug
				connection.query(
					insertCreditQuery,
					[
						banklist(selectedaccount[0]),
						req.user.id,
						1,
						selectedaccount[1],
						true,
						"10/20",
						selectedaccount[2]
					],
					function(err, rows) {
						if (err) {
							console.log(
								"Wrong Insertion in Database something went wrong"
							);
							throw err;
						}
						console.log("Insert Done"); //debug
						console.log(rows); //debug
					}
				);
			}
		} //end for
		res.redirect("/users/dashboard"); //we finish the syncing...we need to check how to render, credit, saving, and current in a good manner
	});

	app.get("/users/dashboard/transactions", isLoggedIn, function(req, res) {
		res.render("./user/dashboard/transactions", {
			title: "Sync Account",
			data: "NOSE QUE ES"
		});
	});

	// =====================================
	// SECTION:CREDIT
	// =====================================
	app.get("/users/dashboard/accounts/credit", isLoggedIn, function(req, res) {
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
			var urilist = [];
			var balance = [];
			for (let i = 0; i < rows.length; i++) {
				var uribase =
					"http://apibank.herokuapp.com/balance/" +
					rows[i].number_acc;
				urilist.push(uribase);
			}
			for (let i = 0; i < urilist.length; i++) {
				var resc = requests("GET", urilist[i]);
				console.log(resc.getBody("utf-8")); //debug
				balance.push(resc.getBody("utf-8"));
			}
			console.log("-----------"); //debug
			console.log(req.user); //debug
			res.render("./user/dashboard/credit", {
				//add more logic here!
				user: req.user, // get the user out of session and pass to template
				dump: "Credit",
				title: "Credit Accounts",
				data: rows,
				balances: balance,
				message: ""
			});
		});
	});

	app.post("/users/dashboard/accounts/credit/delete", isLoggedIn, function(
		req,
		res
	) {
		var bankname = req.body.bank;
		async.waterfall(
			[
				async.apply(findBankID, bankname),
				async.apply(deleteAccount, req)
			],
			function(err, result) {
				console.log(result); //debug
				res.redirect("/users/dashboard/accounts/credit");
			}
		);

		function findBankID(bankname, callback) {
			console.log("Step 1:::Find BANK"); //debug
			console.log(bankname); //debug
			BankIDQuery = "SELECT id_bank FROM bank where name_bank=?;";
			connection.query(BankIDQuery, [bankname], function(err, rows) {
				if (err) {
					console.log(
						"There was a problem meanwhile doing the Query"
					);
					callback(null, "");
				}
				if (rows !== null) {
					console.log(rows); //debug
					callback(null, rows[0].id_bank);
				} else {
					console.log("No existe ese token"); //debug
					console.log(rows); //debug
					callback(null, null);
				}
			});
		}

		function deleteAccount(req, rows, callback) {
			console.log("Step 2 Reset Password"); //debug
			console.log(req.user.id, req.body.anumber, req.body.bank); //debug
			console.log(rows); //debug
			deleteQuery =
				"DELETE FROM account WHERE id=? AND id_bank=? AND number_acc=? AND type_acc=?;";
			connection.query(
				deleteQuery,
				[req.user.id, rows, req.body.anumber, "credit"],
				function(err, rows) {
					if (err) {
						console.log("Wrong delete for Credit");
						req.flash(
							"message",
							"Impossible to Delete Credit Account"
						);
						res.redirect("/users/dashboard/accounts/credit");
					}
					callback(null, "done");
				}
			);
		}
	});
	// =====================================
	// SECTION:CURRENT
	// =====================================
	app.get("/users/dashboard/accounts/current", isLoggedIn, function(
		req,
		res
	) {
		var selectQuery =
			"SELECT name_bank, number_acc FROM account, bank, user WHERE account.id=? AND account.id_bank=bank.id_bank AND user.id=account.id AND account.type_acc=?;";
		connection.query(selectQuery, [req.user.id, "current"], function(
			err,
			rows
		) {
			if (err) {
				console.log("Wrong Query in Credit Database");
				throw err;
			}
			var urilist = [];
			var balance = [];
			for (let i = 0; i < rows.length; i++) {
				var uribase =
					"http://apibank.herokuapp.com/balance/" +
					rows[i].number_acc;
				urilist.push(uribase);
			}
			for (let i = 0; i < urilist.length; i++) {
				var resc = requests("GET", urilist[i]);
				console.log(resc.getBody("utf-8"));
				balance.push(resc.getBody("utf-8"));
			}
			res.render("./user/dashboard/current", {
				//add more logic here!
				user: req.user, // get the user out of session and pass to template
				dump: "Current",
				title: "Current Accounts",
				data: rows,
				balances: balance
			});
		});
	});

	app.post("/users/dashboard/accounts/current/delete", isLoggedIn, function(
		req,
		res
	) {
		var bankname = req.body.bank;
		async.waterfall(
			[
				async.apply(findBankID, bankname),
				async.apply(deleteAccount, req)
			],
			function(err, result) {
				console.log(result);
				res.redirect("/users/dashboard/accounts/current");
			}
		);

		function findBankID(bankname, callback) {
			console.log("Step 1:::Find BANK"); //debug
			console.log(bankname); //debug
			BankIDQuery = "SELECT id_bank FROM bank where name_bank=?;";
			connection.query(BankIDQuery, [bankname], function(err, rows) {
				if (err) {
					console.log(
						"There was a problem meanwhile doing the Query"
					);
					callback(null, "");
				}
				if (rows !== null) {
					console.log(rows); //debug
					callback(null, rows[0].id_bank);
				} else {
					console.log("No existe ese token");
					console.log(rows); //debug
					callback(null, null);
				}
			});
		}

		function deleteAccount(req, rows, callback) {
			console.log("Step 2 Reset Password"); //debug
			console.log(req.user.id, req.body.anumber, req.body.bank); //debug
			console.log(rows); //debug
			deleteQuery =
				"DELETE FROM account WHERE id=? AND id_bank=? AND number_acc=? AND type_acc=?;";
			connection.query(
				deleteQuery,
				[req.user.id, rows, req.body.anumber, "current"],
				function(err, rows) {
					if (err) {
						console.log("Wrong delete for Credit");
						req.flash(
							"message",
							"Impossible to Delete Credit Account"
						);
						res.redirect("/users/dashboard/accounts/current");
					}
					callback(null, "done");
				}
			);
		}
	});

	// =====================================
	// SECTION:SAVING
	// =====================================
	app.get("/users/dashboard/accounts/savings", isLoggedIn, function(
		req,
		res
	) {
		var selectQuery =
			"SELECT name_bank, number_acc FROM account, bank, user WHERE account.id=? AND account.id_bank=bank.id_bank AND user.id=account.id AND account.type_acc=?;";
		connection.query(selectQuery, [req.user.id, "saving"], function(
			err,
			rows
		) {
			if (err) {
				console.log("Wrong Query in Credit Database");
				throw err;
			}
			var urilist = [];
			var balance = [];
			for (let i = 0; i < rows.length; i++) {
				var uribase =
					"http://apibank.herokuapp.com/balance/" +
					rows[i].number_acc;
				urilist.push(uribase);
			}
			for (let i = 0; i < urilist.length; i++) {
				var resc = requests("GET", urilist[i]);
				//console.log(resc.getBody("utf-8"));
				balance.push(resc.getBody("utf-8"));
			}
			res.render("./user/dashboard/savings", {
				//add more logic here!
				user: req.user, // get the user out of session and pass to template
				dump: "Savings",
				title: "Savings Accounts",
				data: rows,
				balances: balance
			});
		});
	});

	app.post("/users/dashboard/accounts/savings/delete", isLoggedIn, function(
		req,
		res
	) {
		console.log(req.body); //debug
		var bankname = req.body.bank;
		async.waterfall(
			[
				async.apply(findBankID, bankname),
				async.apply(deleteAccount, req)
			],
			function(err, result) {
				console.log(result); //debug
				res.redirect("/users/dashboard/accounts/savings");
			}
		);

		function findBankID(bankname, callback) {
			console.log("Step 1:::Find BANK"); //debug
			console.log(bankname); //debug
			BankIDQuery = "SELECT id_bank FROM bank where name_bank=?;";
			connection.query(BankIDQuery, [bankname], function(err, rows) {
				if (err) {
					console.log(
						"There was a problem meanwhile doing the Query"
					);
					callback(null, "");
				}
				if (rows !== null) {
					console.log(rows); //debug
					callback(null, rows[0].id_bank);
				} else {
					console.log("No existe ese token");
					console.log(rows); //debug
					callback(null, null);
				}
			});
		}

		function deleteAccount(req, rows, callback) {
			console.log("Step 2 Reset Password");
			console.log(req.user.id, req.body.anumber, req.body.bank); //debug
			console.log(rows); //debug
			deleteQuery =
				"DELETE FROM account WHERE id=? AND id_bank=? AND number_acc=? AND type_acc=?;";
			connection.query(
				deleteQuery,
				[req.user.id, rows, req.body.anumber, "saving"],
				function(err, rows) {
					if (err) {
						console.log("Wrong delete for Credit");
						req.flash(
							"message",
							"Impossible to Delete Credit Account"
						);
						res.redirect("/users/dashboard/accounts/savings");
					}
					callback(null, "done");
				}
			);
		}
	});
	// =====================================
	// SECTION:PROFILE
	// =====================================
	app.get("/users/password_recovery", function(req, res) {
		res.render("./user/recover_password", {
			//add more logic here!
			user: req.user, // get the user out of session and pass to template
			title: "Password",
			message: ""
		});
	});

	//avoid the green bar!
	app.get("/users/password_recovery_done", function(req, res) {
		res.render("./user/recover_password2", {
			//add more logic here!
			user: req.user, // get the user out of session and pass to template
			title: "Password",
			message: req.flash("message")
		});
	});

	// =====================================
	// SECTION:TRANSACTIONS
	// =====================================

	app.get("/users/dashboard/own_transactions", function(req, res) {
		var selectQuery =
			"SELECT number_acc, id_acc FROM account, user WHERE account.id=? AND user.id=account.id AND (type_acc=? OR type_acc=?);";
		connection.query(
			selectQuery,
			[req.user.id, "saving", "current"],
			function(err, rows) {
				if (err) {
					console.log("Wrong Query in Current Database"); //debug
					throw err;
				}
				console.log(rows); //debug
				res.render("./user/dashboard/own_transactions", {
					//add more logic here!
					user: req.user, // get the user out of session and pass to template
					title: "Transaction",
					data: rows
					//dump:"No se que es"
				});
			}
		);
	});

	app.post("/users/dashboard/own_transactions", function(req, res) {
		function addZero(i) {
			if (i < 10) {
				i = "0" + i;
			}
			return i;
		}
		function get_Date() {
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1;
			var yyyy = today.getFullYear();

			dd = addZero(dd);
			mm = addZero(mm);

			return dd + "-" + mm + "-" + yyyy;
		}
		originAcc: req.body.originAcc;
		destinAcc: req.body.destinationAcc;
		valueTrans: req.body.money;
		console.log(get_Date());
		res.redirect("/users/dashboard/transactions");
	});

	app.get("/users/dashboard/other_transactions", function(req, res) {
		res.render("./user/dashboard/other_transactions", {
			//add more logic here!
			user: req.user, // get the user out of session and pass to template
			title: "Transaction",
			message: req.flash("message"),
			dump: "No se que es"
		});
	});
	app.post("/users/password_recovery", function(req, res, next) {
		//Async magic happens here :) hfjs
		async.waterfall(
			[async.apply(searchEmail, req), createToken, storeToken, sendEmail],
			function(err, result) {
				if (err) return next(err);
				res.redirect("/users/password_recovery_done");
			}
		);

		// =====================================
		// HELPERS: PASSWORD RESET, THIS IS THE MY SAD CODE.
		// =====================================

		function searchEmail(email, callback) {
			console.log("Step 1");
			console.log(req.body); //debug
			var email = req.body.email;
			var queryEmail = "select * from user where username = ?";
			connection.query(queryEmail, [email], function(err, user) {
				if (err) {
					console.log("Error");
					throw err;
				}
				console.log(user); //debug
				var resultEmail = user;
				if (resultEmail.length > 0) {
					emailFound = user[0].username;
				} else {
					req.flash(
						"message",
						"No account with that email address exists."
					);
					emailFound = "";
				}
				callback(null, emailFound);
			});
		}
		function createToken(email, callback) {
			console.log("Step 2");
			console.log("Generar Token");
			if (email !== "") {
				console.log(email); //debug
				var tmpToken = crypto.randomBytes(20).toString("hex");
				callback(null, tmpToken, email);
			} else {
				console.log("Booo no hay resultados,Token No se crea");
				// arg1 now equals 'one' and arg2 now equals 'two'
				callback(null, null, null);
			}
		}

		function storeToken(Token, email, callback) {
			console.log("Step 3"); //debug
			console.log("Store Token"); //debug
			console.log(Token); //debug
			console.log(email); //debug
			if (Token !== null && email !== null) {
				var updateTokenQuery =
					"UPDATE user SET Token=? where username=?";
				connection.query(updateTokenQuery, [Token, email], function(
					err,
					status
				) {
					if (err) {
						console.log(
							"Impossible to update Token, Database Query Error"
						);
						console.log(err); //debug
						callback(null, false, Token, email);
					} else {
						console.log("Token Update Success"); //debug
						callback(null, true, Token, email);
					}
				});
			} else {
				console.log("WTF No hay token generado...shit"); //debug
				callback(null, false, Token, email);
			}
		}

		function sendEmail(flag, Token, email, callback) {
			console.log("Step 4");
			console.log(flag);
			if (flag) {
				console.log("Sending Email :) to"); //debug
				console.log("*********"); //debug
				var smtpTransport = nodemailer.createTransport(
					"smtps://easyfinance.co@gmail.com:" +
						encodeURIComponent("karminakoala2018") +
						"@smtp.gmail.com:465"
				);
				var mailOptions = {
					to: email,
					from: "EasyFinance.co <easyfinance.co@gmail.com>",
					subject: "Easyfinance.co Password Reset",
					text:
						"You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
						"Please click on the following link, or paste this into your browser to complete the process:\n\n" +
						"http://" +
						req.headers.host +
						"/users/reset/" +
						Token +
						"\n\n" +
						"If you did not request this, please ignore this email and your password will remain unchanged.\nSecurity Team Easyfinance.co"
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					req.flash(
						"message",
						"An e-mail has been sent to " +
							email +
							" with further instructions."
					);
					if (err) {
						console.log("NO SE PUDO ENVIAR EL EMAIL");
					} else {
						console.log(
							"Correo  Electronico enviado con instrucciones"
						);
					}

					callback(null, "done");
				});
			} else {
				req.flash("error", "Impossible to Send the email, Try again.");
				//Please try again and render or if we find an  email address with
				console.log(
					"Correo  Electronico NOOO enviado con instrucciones"
				); //debug
				callback(null, "done");
			}
		}
	});
	// =====================================
	// SECTION:Reset new Password
	// =====================================

	// =====================================
	// SECTION:Tokens Validations
	// =====================================
	app.get("/users/reset/:token", function(req, res) {
		TokenQuery = "select * from user where Token=?;";
		connection.query(TokenQuery, [req.params.token], function(err, rows) {
			if (err) {
				console.log("There was a problem meanwhile doing the Query");
				req.flash(
					"message",
					"There was a problem while processing your request"
				);
			}
			console.log(rows);
			if (rows == null || rows.length == 0) {
				console.log("Password reset token is invalid or has expired."); //debug
				return res.redirect("/users/password_recovery");
			}
			console.log(req.user);
			res.render("./user/token_password", {
				title: "Reset Password",
				token: req.params.token
			});
		});
	});

	app.post("/users/reset/:token", function(req, res) {
		console.log(req.params.token);
		console.log(req.body);
		TokenQuery = "select * from user where Token=?;";
		connection.query(TokenQuery, [req.params.token], function(err, rows) {
			if (err) {
				console.log("There was a problem meanwhile doing the Query");
				req.flash(
					"message",
					"There was a problem while processing your request"
				);
			}
			console.log("Token Hallado");
			console.log(rows);
			var userid = rows[0].id;
			if (rows == null || rows.length == 0) {
				console.log("Password reset token is invalid or has expired."); //debug
				return res.redirect("/users/password_recovery");
			}

			data = {
				newPass: req.body.newpassword,
				confirmPass: req.body.confirmpassword
			};

			if (data.newPass === data.confirmPass) {
				var newPassCryp = bcrypt.hashSync(data.newPass, null, null);
				updateQuery = "UPDATE user SET password=? WHERE id=?;";
				connection.query(updateQuery, [newPassCryp, userid], function(
					err,
					row
				) {
					if (err) {
						console.log("Wrong Query in Current Database");
						throw err;
					} else {
						console.log("----Password Updated----");
						res.redirect("/users/login");
						//req.flash("UpdatedPass", "The password was updated");
					}
				});
			} else {
				console.log("----NotMatchPass----"); //debug
				res.redirect("/users/password_recovery");
				//req.flash("NotMatchPass", "The current password does not match");
			}
		});
	});

	// =====================================
	// SECTION:BUDGETS
	// =====================================
	app.get("/users/dashboard/create_budget", isLoggedIn, function(req, res) {
		var selectQuery =
			"SELECT name_bank, number_acc, type_acc FROM account, bank, user WHERE account.id=? AND account.id_bank=bank.id_bank AND user.id=account.id;";
		connection.query(selectQuery, [req.user.id], function(err, rows) {
			if (err) {
				console.log("Wrong Query in Current Database");
				throw err;
			}
			var urilist = [];
			var balance = [];
			for (let i = 0; i < rows.length; i++) {
				var uribase =
					"http://apibank.herokuapp.com/balance/" +
					rows[i].number_acc;
				urilist.push(uribase);
			}
			for (let i = 0; i < urilist.length; i++) {
				var resc = requests("GET", urilist[i]);
				//console.log(resc.getBody("utf-8"));
				balance.push(resc.getBody("utf-8"));
			}

			function numberTypeAcc(user, typeAcc, array, cb) {
				var queryCount =
					"SELECT COUNT(*) AS numberAcc FROM account WHERE account.id=? AND type_acc=?;";
				connection.query(queryCount, [user, typeAcc], function(
					err,
					row
				) {
					if (err) {
						console.log("Wrong Query in Current Database");
						return cb(err);
					}
					array.push(row[0].numberAcc);
					return cb(null);
				});
			}
			res.render("./user/dashboard/create_budget", {
				user: req.user, // get the user out of session and pass to template
				data: rows,
				balances: balance
				//credit: numberAccounts[0],
				//current: numberAccounts[1],
				//saving: numberAccounts[2]
			});
		});
	});

	// =====================================
	// SECTION:BUDGETS
	// =====================================
	app.post("/users/dashboard/create_budget", isLoggedIn, function(req, res) {
		var properties = Object.keys(req.body);
		var values = Object.values(req.body);
		console.log(properties); //debug

		nameBudget = req.body.nameBudget;
		amount = req.body.money;
		currency = req.body.currency;

		var queryCount =
			"SELECT COUNT(type_acc) AS numberAcc FROM account WHERE account.id=?;";
		connection.query(queryCount, [req.user.id], function(err, rows) {
			if (err) {
				console.log("Wrong Query in Current Database");
				throw err;
			}
			//console.log(req.body.hasOwnProperty("accCredit".concat(1)));

			var accountsBudget = [];
			for (let i = 0; i < properties.length; i++) {
				for (let j = 0; j < rows[0].numberAcc; j++) {
					if (
						properties[i] === "accCredit".concat(j) ||
						properties[i] === "accCurrent".concat(j) ||
						properties[i] === "accSaving".concat(j)
					) {
						accountsBudget.push(values[i]);
					}
				}
			}

			var insertBudget =
				"INSERT INTO budget (id, id_currency, name_budget, type_budget, recurrency_budget, totalAmount_budget) VALUES (?, ?, ?, ?, ?, ?);";

			connection.query(
				insertBudget,
				[req.user.id, currency, nameBudget, nameBudget, 0, amount],
				function(err, rows) {
					if (err) {
						console.log("Wrong Query in Current Database");
						throw err;
					}
					var insertAccBudget =
						"INSERT INTO itemBudget (id_budget, id_acc) VALUES ((SELECT id_budget FROM budget WHERE name_budget=?),(SELECT id_acc FROM account WHERE number_acc=?));";
					for (let i = 0; i < accountsBudget.length; i++) {
						connection.query(
							insertAccBudget,
							[nameBudget, accountsBudget[i]],
							function(err, rows) {
								if (err) {
									console.log(
										"Wrong Query in Current Database"
									);
									throw err;
								}
							}
						);
					}
				}
			);
		});
		res.redirect("/users/dashboard/accounts/budget");
	});

	// =====================================
	// SECTION: SHOW BUDGET
	// =====================================
	app.get("/users/dashboard/accounts/budget", isLoggedIn, function(req, res) {
		var selectQuery =
			"SELECT name_budget, totalAmount_budget, name_currency FROM budget, currency WHERE budget.id=? AND budget.id_currency=currency.id_currency;";
		connection.query(selectQuery, [req.user.id], function(err, rows) {
			if (err) {
				console.log("Wrong Query in Current Database");
				throw err;
			}

			res.render("./user/dashboard/budget", {
				user: req.user, // get the user out of session and pass to template
				dump: "Budgets",
				data: rows
			});
		});
	});

	// =====================================
	// SECTION: DELETE BUDGET
	// =====================================
	app.post("/users/dashboard/accounts/budget", isLoggedIn, function(
		req,
		res
	) {
		var budget = req.body.budget;
		var user = req.user.id;

		deleteQuery = "DELETE FROM budget WHERE id=? AND name_budget=?;";
		connection.query(deleteQuery, [user, budget], function(err, rows) {
			if (err) {
				console.log("Wrong Delete of budget");
				//req.flash('message', 'Impossible to Delete Budget');
				throw err;
			}
		});

		res.redirect("/users/dashboard/accounts/budget");
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
	// SECTION: GROUP ACCOUNTS
	// =====================================
	app.get("/users/dashboard/group_accounts", isLoggedIn, function(req, res) {
		res.render("./user/dashboard/group_accounts", {
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
		var selectQuery =
			"SELECT documentNum, fname, lname, username, profilePicture FROM profile, user WHERE profile.id=? AND profile.id=user.id;";
		connection.query(selectQuery, [req.user.id], function(err, rows) {
			if (err) {
				console.log("Wrong Query in Current Database");
				throw err;
			}
			console.log(rows);
			if (rows.length === 0) {
				dataShow = {
					docId: "",
					fname: "",
					lname: "",
					profileName: "Name",
					profilePic: "defaultprofile.png"
				};
			} else {
				dataShow = {
					docId: rows[0].documentNum,
					fname: rows[0].fname,
					lname: rows[0].lname,
					profileName: rows[0].fname,
					profilePic: rows[0].profilePicture
				};
				if (rows[0].fname === null) {
					dataShow.profileName = "Name";
				}
				if (rows[0].profilePicture === null) {
					dataShow.profilePic = "defaultprofile.png";
				}
			}

			res.render("./user/dashboard/profile", {
				user: req.user, // get the user out of session and pass to template
				docId: dataShow.docId,
				fname: dataShow.fname,
				lname: dataShow.lname,
				profilePic: dataShow.profilePic,
				email: req.user.username,
				profileName: dataShow.profileName
			});
		});
	});

	// =====================================
	// SECTION:PROFILE
	// =====================================
	app.post("/users/profile", isLoggedIn, multipartMiddleware, function(
		req,
		res
	) {
		idUser = req.body.iduser;
		nameUser = req.body.fname;
		lnameUser = req.body.lname;
		profilePic = null; //por defecto la ruta de la imagen es null

		var oldpath = req.files.picture.path;
		var extension = req.files.picture.name.split(".").pop();
		var newpath =
			__dirname +
			"/../public/img/users/" +
			req.user.id +
			path.extname(oldpath).toLowerCase();

		if (
			extension === "jpg" ||
			extension === "jpeg" ||
			extension === "png"
		) {
			fs.readFile(oldpath, function(err, dataImg) {
				if (err) {
					console.log(`Error uploading picture: ${err}`);
				} else {
					fs.writeFile(newpath, dataImg, function(err) {
						if (err) {
							console.log(`Error saving picture upload: ${err}`);
						} else {
							//guardar ruta de la imagen
							profilePic =
								"users/" +
								req.user.id +
								path.extname(oldpath).toLowerCase();
						}
					});
				}
			});
		}

		var selectQuery =
			"SELECT id_profile, id, fname, lname, documentNum FROM profile WHERE profile.id=?;";
		connection.query(selectQuery, [req.user.id], function(err, rows) {
			if (err) {
				console.log("Wrong Query in Current Database");
				throw err;
			}

			if (rows.length > 0) {
				//actualizar perfil en la BD
				var updateQuery =
					"UPDATE profile SET fname=?, lname=?, documentNum=?, profilePicture=? WHERE id=?;";
				connection.query(
					updateQuery,
					[nameUser, lnameUser, idUser, profilePic, req.user.id],
					function(err, rows) {
						if (err) {
							condole.log("Error profile update");
							throw err;
						}
					}
				);
			} else {
				//insertar perfil en la BD
				var insertQuery =
					"INSERT INTO profile (id, fname, lname, documentNum, profilePicture) VALUES (?,?,?,?,?);";
				connection.query(
					insertQuery,
					[req.user.id, nameUser, lnameUser, idUser, profilePic],
					function(err, rows) {
						if (err) {
							console.log("Error profile insert");
							throw err;
						}
					}
				);
			}
		});
		res.redirect("/users/profile");
	});

	// =====================================
	// SECTION:PROFILE CHANGE PASS
	// =====================================
	app.post("/users/profile/changepass", isLoggedIn, function(req, res, next) {
		data = {
			oldPass: req.body.oldpassword,
			newPass: req.body.newpassword,
			confirmPass: req.body.confirmpassword
		};
		var passQuery = "SELECT password FROM user WHERE id=?;";
		connection.query(passQuery, [req.user.id], function(err, rows) {
			if (err) {
				console.log("Wrong Query in Current Database");
				throw err;
			}

			if (rows.length > 0) {
				if (bcrypt.compareSync(data.oldPass, rows[0].password)) {
					var newPassCryp = bcrypt.hashSync(data.newPass, null, null);
					updateQuery = "UPDATE user SET password=? WHERE id=?;";
					connection.query(
						updateQuery,
						[newPassCryp, req.user.id],
						function(err, row) {
							if (err) {
								console.log("Wrong Query in Current Database");
								throw err;
							} else {
								console.log("----Password Updated----");
								//req.flash("UpdatedPass", "The password was updated");
							}
						}
					);
				} else {
					console.log("----NotMatchPass----"); //debug
					//req.flash("NotMatchPass", "The current password does not match");
				}
			}
		});
		res.redirect("/users/profile");
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
