const Sequelize = require('sequelize').Sequelize;
const{ gte} = require("sequelize").Op;

const sequelize = new Sequelize('d1qnl3anbo7fr0', 'opitysudeascka', '05a2c06baceb3148cddb96e19bcaf9dc08fbe6a76e3073251c8418250c5ece74', {
    host: "ec2-52-205-61-230.compute-1.amazonaws.com",
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

const Category = sequelize.define('Category', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category: {
        type: Sequelize.STRING,
        allowNull: true
    }
})


const Post = sequelize.define('Post', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.STRING,

    },
    body: {
        type: Sequelize.STRING,

    },
    postDate: {
        type: Sequelize.DATE,

    },
    featureImage: {
        type: Sequelize.STRING,

    },
    published: {
        type: Sequelize.BOOLEAN,

    }
})


Post.belongsTo(Category, { foreignKey: 'category' });


exports.initialize = async function () {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve();
        }).catch(err => {
            reject("unable to load the db");
        });
    })
};

exports.getAllPosts = async () => {
    return new Promise((resolve, reject) => {
        Post.findAll().then(posts => {
            resolve(posts);
        }).catch(err => {
            reject("no results found");
        });
    });
};

exports.getPublishedPosts = async () => {
    return new Promise((resolve, reject) => {
        Post.findAll({ where: { published: true } }).then(posts => {
            resolve(posts);
        }).catch(err => {
            reject("unable to get posts");
        });
    });
};

exports.getCategories = async () => {
    return new Promise((resolve, reject) => {
        Category.findAll().then(categories => {
            resolve(categories);
        }
        ).catch(err => {
            reject("unable to get categories");
        }
        );
    });
};

exports.getPostByCategory = async (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({ where: { category: category } }).then(posts => {
            resolve(posts);
        }
        ).catch(err => {
            reject("unable to get posts");
        }
        );
    });

};
exports.getPublishedPostsByCategory = async (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({ where: { category: category, published: true } }).then(posts => {
            resolve(posts);
        }
        ).catch(err => {
            reject("response not found");
        })
    });
};

exports.getPostsByMinDate = async (minDate) => {
    return new Promise((resolve, reject) => {
        Post.findAll({ where: { postDate: { [gte]: minDate } } }).then(posts => {
            resolve(posts);
        }).catch(err => {
            reject("unable to get posts");
        })
    });
};

exports.getPostById = async (id) => {
    return new Promise((resolve, reject) => {
        Post.findByPk(id).then(post => {
            resolve(post);
        }).catch(err => {
            reject("unable to get post");
        }
        );
    });
};

exports.addPost = async (postData) => {
    postData.published = (postData.published) ? true : false;
    for (let key in postData) {
        if (postData[key] === "" || postData[key] === null || postData[key] === undefined) {
            postData[key] = null;
        }
    }
    postData.postDate = new Date();

    return new Promise((resolve, reject) => {

        Post.create(postData).then(post => {
            resolve(post);
        }).catch(err => {
            reject("unable to add post");
        }
        );

    });
};

exports.addCategory = async (category) => {
    
    for(let key in category){
        if(category[key] ==="" || category[key] === null || category[key] === undefined){
            category[key] = null;
        }
    }
    console.log(category);

    return new Promise((resolve, reject) => {
        Category.create(category).then(category => {
            resolve(category);
        }).catch(err => {
            reject("unable to add category");
        }
        );
    })

}

exports.deleteCategoryById = async (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({ where: { id: id } }).then(category => {
            resolve(category);
        }).catch(err => {
            reject("unable to delete category");
        }
        );
    })
}


exports.deletePostId = async (id) => {
    return new Promise((resolve, reject) => {
        Post.destroy({ where: { id: id } }).then(post => {
            resolve(post);
        }).catch(err => {
            reject("unable to delete post");
        }
        );
    })
}
