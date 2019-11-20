var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require('body-parser');
var request = require('request');
var PORT = process.env.PORT || 3001;
var app = express();


// set the app up with bodyparser
app.use(bodyParser());

// Database configuration
var databaseUrl = process.env.MONGODB_URI || "books_db";
var collections = ["books"];

// Hook mongojs config to db variable
var db = mongojs(databaseUrl, collections);

// Log any mongojs errors to console
db.on("error", function (error) {
    console.log("Database Error:", error);
});

//allow the api to be accessed by other apps
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    next();
});

app.get("/", (req, res) => {
    request('https://www.googleapis.com/books/v1/volumes?q=1984', function (error, response, body) {
        if (error) {
            console.log(error)
        } else {
            res.json(body)
        }
    });
})



app.post("/getBookInfo", (req, res) => {
    let book = req.body.book
    console.log(book)
    request('https://www.googleapis.com/books/v1/volumes?q=' + book, function (error, response, body) {
        if (error) {
            console.log(error)
            res.json({ error: true })
        } else {
            res.json(JSON.parse(body))
        }
    });
})

app.post('/books', function (req, res) {
    let book = req.body.book
    console.log(book)
    request('https://www.googleapis.com/books/v1/volumes?q=' + book, function (error, response, body) {
        if (error) {
            console.log(error)
            res.json({ success: false })
            return
        }
        const items = JSON.parse(body).items
        for (let i = 0; i < items.length; i++) {

            const book = {
                description: items[i].searchInfo.textSnippet,
                title: items[i].volumeInfo.title,
                authors: items[i].volumeInfo.authors,
                image: items[i].volumeInfo.imageLinks.thumbnail,
                link: items[i].saleInfo.buyLink
            }
            db.books.insert(book, function (error, savedBooks) {
                // handle error
                if (i === items.length - 1) {
                    res.json({
                        succes: true,
                        data: items
                    })
                }
            });
        }
        // res.json(JSON.parse(body))
    });
    // var valid = true;
    //validation first
    // var valid = false;

    // var isOnlyOneKey = Object.keys(req.body).length == 1;
    // var onlyNameKey = Object.keys(req.body)[0] == 'name';
    // var isLessThan1000Chars = Object.values(req.body)[0].length <= 1000;

    // valid = isOnlyOneKey && onlyNameKey && isLessThan1000Chars;

    // if (valid) {
    //     db.books.insert(req.body, function (error, savedJoke) {
    //         // Log any errors
    //         if (error) {
    //             res.send(error);
    //         } else {
    //             res.json(savedJoke);
    //         }
    //     });
    // } else {
    //     res.json({
    //         error: 'data was not valid'
    //     })
    // }
});

app.get('/jokes/:id', function (req, res) {
    var joke_id = req.params.id;

    db.jokes.find({
        "_id": mongojs.ObjectID(joke_id)
    }, function (error, joke) {
        if (error) {
            res.send(error);
        } else {
            res.json(joke);
        }
    });

});

// localhost:3001/jokes/f2348hf23hfhhf
app.delete('/jokes/:id', function (req, res) {
    var joke_id = req.params.id;

    db.jokes.remove({
        "_id": mongojs.ObjectID(joke_id)
    }, function (error, removed) {
        if (error) {
            res.send(error);
        } else {
            res.json(joke_id);
        }
    });

});

app.put('/jokes/:id', function (req, res) {
    var joke_id = req.params.id; //what package allows us to do this? by default from express - this allows us to access hard coded parts of the url
    var joke = req.body; //what package allows us to do this? body parser

    db.jokes.findAndModify({
        query: {
            "_id": mongojs.ObjectId(joke_id)
        },
        update: {
            $set: {
                "name": req.body.name
            }
        },
        new: true
    }, function (err, updatedJoke) {
        res.json(updatedJoke);
    });

});

app.put("/jokes/votes/:id/:direction", function (req, res) {

    var voteChange = 0;

    if (req.params.direction == 'up') voteChange = 1;
    else voteChange = -1;

    //this is wrong I want to grab the current votes and increment by 1
    db.jokes.findAndModify({
        query: {
            "_id": mongojs.ObjectId(req.params.id)
        },
        update: { $inc: { votes: voteChange } },
        new: true
    }, function (err, editedJoke) {
        res.json(editedJoke);
    });
});



// Listen on port 3001
app.listen(PORT, function () {
    console.log('🌎 ==> Now listening on PORT %s! Visit http://localhost:%s in your browser!', PORT, PORT);
});