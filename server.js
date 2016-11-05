// DEPENDENCIES
var bodyParser	= require('body-parser');
var cheerio		= require('cheerio');
var express		= require('express');
var mongoose	= require('mongoose');
var logger		= require('morgan');
var request		= require('request');
var exphbs		= require('express-handlebars');
var app			= express();

// Morgan and Body-Parser:
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static directory:
app.use(express.static('public'));

// Database configuration with mongoose:
mongoose.connect('mongodb://localhost/week18day3mongoose');
var db = mongoose.connection;

// Show any Mongoose errors:
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// Once logged in to the db through Mongoose, log a success message:
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

// And we bring in our Note and Article models
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');

// ROUTES
// Simple index route
app.get('/', function(req, res) {
  res.send(index.html);
});

// A GET request to scrape the NYT website.
app.get('/scrape', function(req, res) {
	// Grab the body of the HTML:
	request('www.nytimes.com', function(error, response, html) {
		// Load this into Cheerio and save it to $ for a shorthand selector:
		var $ = cheerio.load(html);
		// Grab everything with an "H2 class=story-heading" tag:
		$('story-heading H2').each(function(i, element) {
			// Save an empty result object:
			var result = {};
			// Add the text and href of every link
			// and save them as properties of the result object:
			result.title = $(this).find('').text();
			result.link = $(this).find('').attr('href');
			// Create a new entry using the Article model:
			// The (result) effectively passes the result object to the entry (and the title and link):
			var entry = new Article (result);
			// Save that entry to the db
			entry.save(function(err, doc) {
				// Log any errors
				if (err) {
					console.log(err);
				}
				// Or log the doc
				else {
					console.log(doc);
				}
			});
		});
	});
	// Tell the browser that the scrape is complete:
	res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get('/articles', function(req, res){
	// Grab every doc in the Articles array:
	Article.find({}, function(err, doc){
		// Log any errors:
		if (err){
			console.log(err);
		}
		// Or send the doc to the browser as a json object:
		else {
			res.json(doc);
		}
	});
});

// Grab an article by its ObjectId:
app.get('/articles/:id', function(req, res){
	// Using the id passed in the id parameter,
	// prepare a query that finds the matching one in our db...
	Article.findOne({'_id': req.params.id})
	// and populate all of the notes associated with it.
	.populate('note')
	// Now, execute our query:
	.exec(function(err, doc){
		// Log any errors:
		if (err){
			console.log(err);
		}
		// Otherwise, send the doc to the browser as a JSON object:
		else {
			res.json(doc);
		}
	});
});


// Replace the existing note of an article with a new one.
// Or, if no note exists for an article, make the posted note its note.
app.post('/articles/:id', function(req, res){
	// Create a new note and pass the req.body to the entry.
	var newNote = new Note(req.body);

	// Save the new note the db
	newNote.save(function(err, doc){
		// Log any errors:
		if(err){
			console.log(err);
		}
		// Otherwise...
		else {
			// Using the Article ID passed in the id parameter of our url,
			// prepare a query that finds the matching Article in our db
			// and update it to make its lone note the one we just saved.
			Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
			// Execute the above query:
			.exec(function(err, doc){
				// Log any errors:
				if (err){
					console.log(err);
				} else {
					// Or send the document to the browser:
					res.send(doc);
				}
			});
		}
	});
});



app.listen(3000, function() {
  console.log('App running on port 3000!');
});