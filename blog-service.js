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

exports.getPostByCategory = async (category) => {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject("posts.json not loaded");
        } else {
            const res = posts.filter((post) => post.category === parseInt(category));
            if (res == null || res.length == 0) {
                reject("no posts found");
            }
            else {
                resolve(res);
            }
        }
    });
}

exports.getPostsByMinDate = async (minDate) => {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject("posts.json not loaded");
        } else {
            const res = posts.filter((post) => {
                return new Date(post.postDate) >= new Date(minDate)
            });
            if (res == null || res.length == 0) {
                reject("no posts found");
            } else {
                resolve(res);
            }
        }
    });
}

exports.getPostById = async (id) => {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject("posts.json not loaded");
        } else {
            const res = posts.find((post) => post.id.toString() === id.toString());
            if (res == null || res.length == 0) {

                reject("no posts found");
            } else {
                resolve(res);
            }
        }
    });
}


exports.addPost = async (postData) => {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject("posts.json not loaded");
        } else {
            if (postData.published === undefined) {
                postData.published = false;
            } else {
                postData.published = true;
            }
            postData.id = posts.length + 1;
            posts.push(postData);
            resolve(postData);
        }
    });
}