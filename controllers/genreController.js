var Book = require('../models/book');
var async = require('async');
var Genre = require('../models/genre');

// Display list of all Genres
exports.genre_list = function(req, res, next) {

  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_genres) {
      if (err) {return next(err);}
      //Successful, so render
      res.render('genre_list', {title: 'Genre List', genre_list: list_genres});
   });

};

// Display detail page for a specific Genre
exports.genre_detail = function(req, res, next) {

  async.parallel({
    genre: function(callback) { 
      Genre.findById(req.params.id)
        .exec(callback);
   },
        
    genre_books: function(callback) {           
      Book.find({'genre': req.params.id})
      .exec(callback);
   },

 }, function(err, results) {
    if (err) {return next(err);}
    // Successful, so render.
    res.render(
      'genre_detail',
      {title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books}
    );
 });

};

// Display Genre create form on GET
exports.genre_create_get = function(req, res, next) {
  res.render('genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST
exports.genre_create_post = function(req, res, next) {

  // Check that the name field is not empty
  req.checkBody('name', 'Genre name required').notEmpty(); 
  
  // Trim and escape the name field. 
  req.sanitize('name').escape();
  req.sanitize('name').trim();

  // Run the validators
  var errors = req.validationErrors();

  // Create a genre object with escaped and trimmed data.
  var genre = new Genre({name: req.body.name});

  // If there are errors:
  if (errors) {
    // Render the form again, passing the previously entered values and errors.
    res.render('genre_form', {title: 'Create Genre', genre: genre, errors: errors});
    return;
  }
  // Otherwise:
  else {
    // Data from the form are valid.
    // Check whether a genre with the same name already exists.
    Genre.findOne({'name': req.body.name})
      .exec(function(err, found_genre) {
         if (err) {return next(err);}
         // If the genre exists:
         if (found_genre) {
           // Redirect to its detail page.
           res.redirect(found_genre.url);
         }
         // Otherwise:
         else {
           // Save the genre.
           genre.save(function (err) {
             if (err) {return next(err);}
             // Redirect to its detail page.
             res.redirect(genre.url);
           });
         }
      });
  }

};

// Display Genre delete form on GET
exports.genre_delete_get = function(req, res, next) {       

  async.parallel({
    genre: function(callback) {     
      Genre.findById(req.params.id).exec(callback);
    },
    genres_books: function(callback) {
      Book.find({'genre': req.params.id}).exec(callback);
    }
  }, function(err, results) {
    if (err) {return next(err);}
    // Successful, so render.
    res.render('genre_delete', {
      title: 'Delete Genre',
      genre: results.genre,
      genre_books: results.genres_books
    });
  });

};

// Handle Genre delete on POST 
exports.genre_delete_post = function(req, res, next) {

  req.checkBody('genreid', 'Genre ID must exist').notEmpty(); 

  async.parallel({
    genre: function(callback) {   
      Genre.findById(req.body.genreid).exec(callback);
    },
    genres_books: function(callback) {
      Book.find({'genre': req.body.genreid}, 'title summary').exec(callback);
    }
  }, function(err, results) {
    if (err) {return next(err);}
    //Success. If the genre is a genre of any books:
    if (results.genres_books > 0) {
      // Render in the same way as for the GET route.
      res.render('genre_delete', {
        title: 'Delete Genre',
        genre: results.genre,
        genre_books: results.genres_books
      });
      return;
    }
    // Otherwise, i.e. if the genre is a genre of no book:
    else {
      // Delete the genre object and redirect to the list of genres.
      Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
        if (err) {return next(err);}
        res.redirect('/catalog/genres');
      });
    }
  });

};

// Display genre update form on GET
exports.genre_update_get = function(req, res, next) {

  req.sanitize('id').escape();
  req.sanitize('id').trim();

  // Get genres for form
  async.parallel({
    genre: function(callback) {
      Genre.findById(req.params.id).exec(callback);
    }
  }, function(err, results) {
    if (err) {return next(err);}
    res.render('genre_form', {
      title: 'Update Genre',
      genre: results.genre
    });
  });

};

// Handle genre update on POST 
exports.genre_update_post = function(req, res, next) {

  //Sanitize id passed in. 
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  //Check other data
  req.checkBody('name', 'Name must not be empty.').notEmpty();

  var genre = new Genre({
    name: req.body.name,
    // Prevent assignment of new ID.
    _id: req.params.id
  });

  var errors = req.validationErrors();
  if (errors) {
    // Re-render genre with error information.
    res.render('genre_form', {
      title: 'Update Genre',
      genre: genre,
      errors: errors
    });

  } 
  else {
    // Data from form are valid. Update the record.
    Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, thegenre) {
      if (err) {return next(err);}
      // Successful. Redirect to book detail page.
      res.redirect(thegenre.url);
    });
  }

};
