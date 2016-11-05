var mongoose = require('mongoose');

// Create Schema class:
var Schema = mongoose.Schema;
// create the Note schema:
var NoteSchema = new Schema({
	// just a string
	title: {
		type:String
	},
	// just a string
	body: {
		type:String
	}
});

// Mongoose automatically saves the ObjectIds of the notes.
// These ids are referred to in the Article model.

// Create the Note model with the NoteSchema:
var Note = mongoose.model('Note', NoteSchema);

// Export the Note model:
module.exports = Note;