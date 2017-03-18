var moment = require('moment');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BookInstanceSchema = Schema({
  book: { type: Schema.ObjectId, ref: 'Book', required: true }, //reference to the book
  imprint: {type: String, required: true},
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
    default: 'Maintenance'
  },
  due_back: {type: Date, default: Date.now},
});

// Virtual property for bookinstance's URL
BookInstanceSchema
.virtual('url')
.get(function () {
  return '/catalog/bookinstance/' + this._id;
});

// Virtual property for bookinstance's due date formatted for display
BookInstanceSchema
.virtual('due_back_pretty')
.get(function () {
  return this.due_back ? moment(this.due_back).format('dddd, DD MMMM YYYY') : '';
});

// Virtual property for bookinstance's due date formatted for form input
BookInstanceSchema
.virtual('due_back_formatted')
.get(function () {
  return this.due_back ? moment(this.due_back).format('YYYY-MM-DD') : '';
});

//Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);
