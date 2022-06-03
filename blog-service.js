const fs = require("fs");
let posts = [];
let categories = [];

exports.initialize = async function () {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/posts.json", (err, data) => {
            if (err) {
                reject("unable to read file");
            } else {
                posts = JSON.parse(data);
                fs.readFile("./data/categories.json", (err, data) => {
                    if (err) {
                        reject("unable to read file");
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
};

exports.getAllPosts = async () => {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject("posts.json not loaded");
        } else {
            resolve(posts);
        }
    });
};

exports.getPublishedPosts = async () => {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject("posts.json not loaded");
        } else {
            resolve(posts.filter((post) => post.published === true));
        }
    });
};

exports.getCategories = async () => {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject("categories.json not loaded");
        } else {
            resolve(categories);
        }
    });
};
