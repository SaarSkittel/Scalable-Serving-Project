const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
//CONNEFION TO DB
const connection = mysql.createConnection({
    host: "172.28.0.8",
    port: "3306",
    user: "Saar",
    password: "Password",
    database: "users",
});

//CREATE TABLE IN DB
function databaseSetup() {
    connection.connect((err) => {
        connection.query(
            "CREATE TABLE IF NOT EXISTS users(id INTEGER AUTO_INCREMENT, user_name VARCHAR(255) NOT NULL, full_name TEXT NOT NULL, password TEXT NOT NULL, token TEXT, PRIMARY KEY(id, user_name));",
            (err, result) => {
                if (err) throw err;
            }
        );
    });
}

const port = process.env.PORT || 80;

//CREATE TABLE IF NOT EXISTS users(id INTEGER AUTO_INCREMENT, user_name VARCHAR(255) NOT NULL, full_name TEXT NOT NULL, password TEXT NOT NULL, PRIMARY KEY(id, user_name));
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    databaseSetup();
});

app.get("/", (req, res) => {
    const token = req.cookies.AccessToken;
    let verification = verifyAccessToken(token);
    if (verification === true) {
        const user = jwt.decode(token, process.env.ACCCESS_TOKEN_SECRET).user_name;
        res.send(JSON.stringify(`Hello, ${user}`));
    }
});

app.post("/register", (req, res) => {
    //CHECK IF THE USER ALREADY EXISTS
    connection.query(
        "SELECT user_name FROM users WHERE user_name= ?;",
        req.body.userName,
        (err, result, fields) => {
            if (err) throw err;
            //INSERT USER TO DB W/ HANDLING ERRORS
            if (result.length === 0) {
                let query =
                    "INSERT INTO users (user_name, full_name, password) VALUES (?);";
                let values = [req.body.userName, req.body.fullName, req.body.password];
                connection.query(query, [values], (err, result) => {
                    if (err) {
                        res.send(
                            JSON.stringify({ response: "Error", port: port, status: err })
                        );
                        throw err;
                    } else {
                        res.send(
                            JSON.stringify({ response: "OK", port: port, status: result })
                        );
                    }
                });
            } else {
                //IF THE USER EXISTS
                res.send(
                    JSON.stringify({
                        response: "error",
                        port: port,
                        status: "User already esists.",
                    })
                );
            }
        }
    );
});

app.post("/changePassword", (req, res) => {
    const verify = verifyAccessToken(req.cookies.AccessToken);
    if (verify === true) {
        const user = jwt.decode(
            req.cookies.accessToken,
            process.env.ACCCESS_TOKEN_SECRET
        ).user_name;
        connection.query("UPDATE users SET password = ? WHERE user_name = ?;", [
            req.body.password,
            user,
        ]);
        res.cookie("AccessToken", accessToken, { httpOnly: true, path: "/" });
        res.send(
            JSON.stringify({
                response: "OK",
                port: port,
                status: "Assigned new token",
            })
        );
    }
});

app.post("/users", async(req, res) => {
    const verify = verifyAccessToken(req.cookies.AccessToken);
    if (verify === true) {
        const id = req.query.id;
        const name = req.query.name;
        if (id !== undefined) {
            console.log(`request id: ${id}`);
            connection.query(
                "SELECT id, user_name, full_name FROM users WHERE id = ?;", [parseInt(id)],
                (err, result) => {
                    if (err) {
                        res.sendStatus(404);
                    } else {
                        console.log(`id name: ${JSON.stringify(result)}`);
                        res.send(result);
                    }
                }
            );
        } else if (name !== undefined) {
            console.log(`request name: ${name}`);
            connection.query(
                "SELECT id, user_name, full_name FROM users WHERE user_name = ?;", [name],
                (err, result) => {
                    if (err) {
                        res.sendStatus(404);
                    } else {
                        console.log(`name users:${JSON.stringify(result)}`);
                        res.send(result);
                    }
                }
            );
        } else {
            connection.query(
                "SELECT id, user_name, full_name FROM users;",
                (err, result) => {
                    if (err) {
                        res.sendStatus(404);
                    } else {
                        console.log(`all users: ${JSON.stringify(result)}`);
                        res.send(result);
                    }
                }
            );
        }
    }
});

app.delete("/logout", (req, res) => {
    const token = req.cookies.AccessToken;
    const user = jwt.decode(token, process.env.ACCCESS_TOKEN_SECRET).user_name;
    console.log(`user name: ${user}`);
    connection.query(
        "UPDATE users SET token = NULL WHERE user_name = ?;", [user],
        (err, result) => {
            if (err) {
                console.log(`Token delete token: ${err}`);
            } else {
                res.clearCookie("AccessToken");
                res.sendStatus(200);
            }
        }
    );
});

app.post("/login", (req, res) => {
    connection.query(
        "SELECT * FROM users WHERE user_name= ?;",
        req.body.userName,
        (err, result, fields) => {
            if (err) {
                console.log(err);
                throw err;
            } else if (result.length === 0) {
                res.send(
                    JSON.stringify({
                        response: "Error",
                        port: port,
                        status: "User doesn't exist",
                    })
                );
            } else if (
                result[0].user_name === req.body.userName &&
                result[0].password === req.body.password
            ) {
                const verify = verifyAccessToken(result[0].token);
                console.log(`Verification: ${verify}`);
                if (verify === false) {
                    const userName = req.body.userName;
                    const user = { user_name: userName };
                    const accessToken = generateAccessToken(user);
                    connection.query("UPDATE users SET token = ? WHERE id = ?", [
                        accessToken,
                        result[0].id,
                    ]);
                    res.cookie("AccessToken", accessToken, {
                        httpOnly: true,
                    });
                    res.send(
                        JSON.stringify({
                            response: "OK",
                            port: port,
                            status: "Assigned new token",
                        })
                    );
                } else {
                    res
                        .cookie("AccessToken", result[0].token, {
                            httpOnly: true,
                        })
                        .send(
                            JSON.stringify({
                                response: "OK",
                                port: port,
                                status: "Valid token",
                            })
                        );
                }
            } else {
                res.send(
                    JSON.stringify({
                        response: "ERROR",
                        port: port,
                        status: "",
                    })
                );
            }
        }
    );
});

app.get("/auth", (req, res) => {
    let isLoggedin;
    if (!verifyAccessToken(req.cookies.AccessToken)) {
        isLoggedin = false;
    } else {
        isLoggedin = true;
    }
    res.send(JSON.stringify({ loginStatus: isLoggedin }));
});

function verifyAccessToken(token) {
    let isValid = false;
    if (token === undefined) isValid = false;
    else {
        jwt.verify(token, process.env.ACCCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                console.log(`Validation error:${err}`);
                isValid = false;
            } else {
                isValid = true;
            }
        });
    }
    console.log(`Validation: ${isValid}`);
    return isValid;
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCCESS_TOKEN_SECRET, { expiresIn: "24h" });
}