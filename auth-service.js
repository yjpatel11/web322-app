const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    email: {
        type: String,
    },
    loginHistory: [
        {
            dateTime: {
                type: Date,
                default: Date.now,
            },
            userAgent: {
                type: String,
            },
        },
    ],
});

let User = mongoose.model("users", userSchema);

module.exports.initializeDB = () => {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(
            "mongodb+srv://yash_web:yjpatel11@cluster0.mywbtxx.mongodb.net/?retryWrites=true&w=majority",
            
            {
                useNewUrlParser: true,
            }
        );
        db.on("error", (err) => {
            reject(err);
        });
        db.once("open", () => {
            User = db.model("users", userSchema);

            resolve();
        });
    });
};

exports.registerUser = function (userData) {
    const { userName, password, password2, email, userAgent } = userData;

    return new Promise(function (resolve, reject) {
        if (password !== password2) {
            reject("passwords does not match");
        } else {
            bcrypt
                .hash(password, 10)
                .then((hashedPassword) => {
                    let user = new User({
                        userName: userName,
                        password: hashedPassword,
                        email: email,
                        loginHistory: [
                            {
                                dateTime: Date.now(),
                                userAgent: userAgent,
                            },
                        ],
                    });

                    user.save()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            if (err.code === 11000) {
                                reject("User Name already taken");
                            } else {
                                reject(
                                    "There was an error creating the user:" +
                                        err
                                );
                            }});}).catch((err) => {
                    reject("There was an error encrypting the password:" + err);
                });
        }
    });
};

exports.checkUser = async (userData) => {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName })
            .then((user) => {
                if (user.length === 0) {
                    reject("Unable to find user:" + userData.userName);
                } else {
                    bcrypt
                        .compare(userData.password, user[0].password)
                        .then((isSame) => {
                            if (isSame) {
                                user[0].loginHistory.push({
                                    dateTime: Date.now(),
                                    userAgent: userData.userAgent,
                                });
                                User.updateOne(
                                    {
                                        userName: userData.userName,
                                    },
                                    {
                                        $set: {
                                            loginHistory: user[0].loginHistory,
                                        },
                                    }
                                )
                                    .then(() => {
                                        resolve(user[0]);
                                    })
                                    .catch((err) => {
                                        reject(
                                            "There was an error verifying the user: " +
                                                err
                                        );
                                    });
                            } else {
                                reject(
                                    "Incorrect password for user:" +
                                        userData.userName
                                );
                            }
                        });
                }
            })
            .catch((err) => {
                reject("Unable to find user: " + userData.userName);
            });
    });
};
