/********************************************************************************* 
 * WEB322 – Assignment 06 *
 * I declare that this assignment is my own work in accordance with 
 * Seneca Academic Policy. No part Of this assignment has been copied
 * manually or electronically from any other source *
 * (including 3rd party web sites) or distributed to other students. * 
 
* Name: yash Jagdishchandra Patel 
  Student ID: 133308205 
  Date: 05-08-2022 * * 
  Online (Heroku) Link:  https://web322-app-yash.herokuapp.com/about
* *********************************************************************************/

const express = require("express");
const app = express();
const blogService = require("./blog-service");
const authService = require("./auth-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");
const clientSessions = require("client-sessions");

cloudinary.config({
    cloud_name: "des0oxsfb",
    api_key: "464199747314738",
    api_secret: "jT5X5KV0j84WODMDDRPRdShzZmc",
    secure: true,
});

const esureLogin = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
};

const upload = multer();

const port = process.env.PORT || 8080;
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.engine(
    "handlebars",
    exphbs.engine({
        defaultLayout: "main",
        helpers: {
            navLink: function (url, options) {
                return (
                    "<li" +
                    (url == app.locals.activeRoute ? ' class="active" ' : "") +
                    '><a href="' +
                    url +
                    '">' +
                    options.fn(this) +
                    "</a></li>"
                );
            },
            equal: function (lvalue, rvalue, options) {
                if (arguments.length < 3)
                    throw new Error(
                        "Handlebars Helper equal needs 2 parameters"
                    );
                if (lvalue != rvalue) {
                    return options.inverse(this);
                } else {
                    return options.fn(this);
                }
            },
            safeHTML: function (context) {
                return stripJs(context);
            },
            formatDate: function (dateObj) {
                let year = dateObj.getFullYear();
                let month = (dateObj.getMonth() + 1).toString();
                let day = dateObj.getDate().toString();
                return `${year}-${month.padStart(2, "0")}-${day.padStart(
                    2,
                    "0"
                )}`;
            },
        },
    })
);

app.set("view engine", "handlebars");
app.use(
    clientSessions({
        cookieName: "session",
        secret: "yash6",
        duration: 2 * 60 * 60 * 1000,
        activeDuration: 1000 * 60 * 5,
    })
);

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute =
        "/" +
        (isNaN(route.split("/")[1])
            ? route.replace(/\/(?!.*)/, "")
            : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.get("/", (_, res) => {
    res.redirect("/about");
});

app.get("/about", (_, res) => {
    res.render("about");
});

app.get("/blog", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};

    try {
        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blogService.getPublishedPostsByCategory(
                req.query.category
            );
        } else {
            // Obtain the published "posts"
            posts = await blogService.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0];

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blogService.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData });
});
app.get("/blog/:id", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};

    try {
        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blogService.getPublishedPostsByCategory(
                req.query.category
            );
        } else {
            // Obtain the published "posts"
            posts = await blogService.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the post by "id"
        viewData.post = await blogService.getPostById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blogService.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData });
});

app.get("/posts", esureLogin, (req, res) => {
    const { category, minDate } = req.query;

    if (category) {
        blogService
            .getPostByCategory(category)
            .then((posts) => {
                if (posts.length > 0) {
                    res.render("posts", { posts });
                } else {
                    res.render("posts", { message: "no results" });
                }
            })
            .catch((err) => {
                res.render("posts", { message: "no results" });
            });
    } else if (minDate) {
        blogService
            .getPostsByMinDate(minDate)
            .then((posts) => {
                if (posts.length > 0) {
                    res.render("posts", { posts });
                } else {
                    res.render("posts", { message: "no results" });
                }
            })
            .catch((err) => {
                res.render("posts", { message: "no results" });
            });
    } else {
        blogService
            .getAllPosts()
            .then((posts) => {
                if (posts.length > 0) {
                    res.render("posts", { posts });
                } else {
                    res.render("posts", { message: "no results" });
                }
            })
            .catch((err) => {
                res.render("posts", { message: "no results" });
                z;
            });
    }
});

app.get("/posts/add", esureLogin, (_, res) => {
    blogService
        .getCategories()
        .then((categories) => {
            res.render("addPost", { categories });
        })
        .catch((err) => {
            res.render("addPost", { message: "no results" });
        });
});

app.get("/post/:id", esureLogin, async (req, res) => {
    const id = req.params.id;
    blogService
        .getPostById(id)
        .then((post) => {
            res.send(post);
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

app.get("/posts/delete/:id", esureLogin, (req, res) => {
    blogService
        .deletePostId(req.params.id)
        .then((post) => {
            res.redirect("/categories");
        })
        .catch((err) => {
            res.status(500).json({
                message: "Unable to Remove Category / Category not found)",
            });
        });
});

app.post(
    "/posts/add",
    esureLogin,
    upload.single("featureImage"),
    async (req, res, next) => {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
        upload(req).then((uploaded) => {
            let date = new Date();
            date.toISOString().split("T")[0];
            req.body.featureImage = uploaded.url;
            blogService
                .addPost({
                    ...req.body,
                    postDate: date,
                })
                .then((post) => {
                    res.redirect("/posts");
                })
                .catch((err) => {
                    res.json({ message: err });
                });
        });
    }
);

app.get("/categories", esureLogin, (_, res) => {
    blogService
        .getCategories()
        .then((categories) => {
            if (categories.length > 0) {
                res.render("categories", { categories });
            } else {
                res.render("categories", { message: "no results" });
            }
        })
        .catch((err) => {
            res.render("categories", { message: "no results" });
        });
});
app.get("/categories/add", esureLogin, (_, res) => {
    res.render("addCategory");
});
app.post("/categories/add", esureLogin, (req, res) => {
    console.log(req.body);
    blogService
        .addCategory({
            ...req.body,
        })
        .then((post) => {
            res.redirect("/categories");
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

app.get("/categories/delete/:id", esureLogin, (req, res) => {
    blogService
        .deleteCategoryById(req.params.id)
        .then((post) => {
            res.redirect("/categories");
        })
        .catch((err) => {
            res.status(500).json({
                message: "Unable to Remove Category / Category not found)",
            });
        });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get("User-Agent");
    authService
        .checkUser(req.body)
        .then((user) => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory,
            };
            res.redirect("/posts");
        })
        .catch((err) => {
            res.render("login", {
                errorMessage: err,
                userName: req.body.userName,
            });
        });
});

app.post("/register", (req, res) => {
    authService
        .registerUser(req.body)
        .then((user) => {
            res.render("register", { successMessage: "User created" });
        })
        .catch((err) => {
            res.render("register", {
                errorMessage: err,
                userName: req.body.userName,
            });
        });
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.get("/userHistory", esureLogin, (req, res) => {
    res.render("userHistory");
});

app.get("*", (_, res) => {
    res.render("404");
});

blogService
    .initialize()
    .then(authService.initializeDB)
    .then(() => {
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
