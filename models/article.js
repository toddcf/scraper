var mongoose = require('mongoose');

// Create Schema class:
var Schema = mongoose.Schema;
// Create the Article schema:
var ArticleSchema = new Schema({
	// title is required
	title: {
		type:String,
		required:true
	},
	// link is required
	link: {
		type:String,
		required:true
	},
	// this only saves one note's ObjectId. ref refers to the Note model.
	note: {
		type: Schema.Types.ObjectId,
		ref: 'Note'
	}
});

// Create the Article model with the ArticleSchema:
var Article = mongoose.model('Article', ArticleSchema);

// Export the Article model:
module.exports = Article;