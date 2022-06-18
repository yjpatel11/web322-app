/********************************************************************************* * WEB322 – Assignment 03 * I declare that this assignment is my own work in accordance with 
 * Seneca Academic Policy. No part
* Of this assignment has been copied manually or electronically from any other source * (including 3rd party web sites) or distributed to other students. * 
* Name: yash Jagdishchandra Patel 
Student ID: 133308205 
Date: 17-062022 * * 
Online (Heroku) Link: ___________https://web322-app-yash.herokuapp.com/about_____________________________________________ 
* *********************************************************************************/






const express = require("express");
const app = express();
const blogService = require("./blog-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
    cloud_name: "des0oxsfb",
    api_key: "464199747314738",
    api_secret: "jT5X5KV0j84WODMDDRPRdShzZmc",
    secure: true,
})

const upload = multer();

const port = process.env.PORT || 8080;
app.use(express.static("public"));

app.get("/", (_, res) => {
    res.redirect("/about");
});

app.get("/about", (_, res) => {
    res.sendFile(__dirname + "/views/about.html");
});

app.get("/blog", (_, res) => {
    blogService
        .getPublishedPosts()
        .then((posts) => {
            res.send(posts);
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

app.get("/posts", (req, res) => {
    const { category, minDate } = req.query;

    if (category) {
        blogService.getPostByCategory(category).then((posts) => {
            res.send(posts);
        }
        ).catch((err) => {
            res.json({ message: err });
        }
        );
    } else if (minDate) {
        blogService.getPostsByMinDate(minDate).then((posts) => {
            res.send(posts);
        }
        ).catch((err) => {
            res.json({ message: err });
        }
        );
    } else {
        blogService.getAllPosts().then((posts) => {
            res.send(posts);
        }
        ).catch((err) => {
            res.json({ message: err });
        }
        );
    }
});




app.get("/posts/add", (_, res) => {
    res.sendFile(__dirname + "/views/addPost.html");
})
app.get("/post/:id", async (req, res) => {
    const id = req.params.id;
    blogService.getPostById(id).then((post) => {
       
        res.send(post);
    }
    ).catch((err) => {
        res.json({ message: err });
    }
    );
})

app.post("/posts/add", upload.single("featureImage"), async (req, res, next) => {
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
        req.body.featureImage = uploaded.url;
        blogService.addPost(req.body).then((post) => {
            res.redirect("/posts");
        }).catch((err) => {
            res.json({ message: err });
        });
    });
})

app.get("/categories", (_, res) => {
    blogService
        .getCategories()
        .then((categories) => {
            res.send(categories);
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

app.get("*", (_, res) => {
    res.sendFile(__dirname + "/views/not-found.html");
});

blogService
    .initialize()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
