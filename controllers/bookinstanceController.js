var Book = require('../models/book');
var BookInstance = require('../models/bookinstance');

var async = require('async');

// Display list of all BookInstances
exports.bookinstance_list = function(req, res, next) {

  BookInstance.find()
    .populate('book')
    .exec(function (err, list_bookinstances) {
      if (err) {return next(err);}
      //Successful, so render
      res.render(
        'bookinstance_list',
        {title: 'Book Instance List', bookinstance_list: list_bookinstances}
      );
    });
    
};

// Display detail page for a specific BookInstance
exports.bookinstance_detail = function(req, res, next) {

  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) {return next(err);}
      //Successful, so render
      res.render('bookinstance_detail', {title: 'Book:', bookinstance: bookinstance});
    });
    
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = function(req, res, next) {
  Book.find({},'title')
    .exec(function (err, books) {
      if (err) {return next(err);}
      // Successful, so render.
      res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books});
    });
};

// Handle BookInstance create on POST 
exports.bookinstance_create_post = function(req, res, next) {

  req.checkBody('book', 'Book must be specified').notEmpty();
  req.checkBody('imprint', 'Imprint must be specified').notEmpty();
  req.checkBody('due_back', 'Invalid date').optional({checkFalsy: true}).isDate();
  
  req.sanitize('book').escape();
  req.sanitize('imprint').escape();
  req.sanitize('status').escape();
  req.sanitize('book').trim();
  req.sanitize('imprint').trim();  
  req.sanitize('status').trim();
  // Do not complain about a due date even if the instance is now available.
  req.sanitize('due_back').toDate();
  
  var bookinstance = new BookInstance({
    book: req.body.book,
    imprint: req.body.imprint, 
    status: req.body.status,
    due_back: req.body.due_back
  });

  var errors = req.validationErrors();
  // If there are errors in the submitted values:
  if (errors) {  
    Book.find({},'title')
      .exec(function (err, books) {
        if (err) {return next(err);}
        // Successful, so render.
        res.render('bookinstance_form', {
          title: 'Create BookInstance',
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors,
          bookinstance: bookinstance
        });
    });
    return;
  }
  // Otherwise, i.e. if the values are valid:
  else {
    // Save the book instance.
    bookinstance.save(function (err) {
      if (err) {return next(err);}
      // Redirect to the new book instance’s record.
      res.redirect(bookinstance.url);
    }); 
  }

};

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = function(req, res, next) {       

  async.parallel({
    bookinstance: function(callback) {     
      BookInstance.findById(req.params.id).exec(callback);
    }
  }, function(err, results) {
    if (err) {return next(err);}
    // Successful, so render.
    res.render('bookinstance_delete', {
      title: 'Delete Book Instance',
      bookinstance: results.bookinstance
    });
  });

};

// Handle BookInstance delete on POST 
exports.bookinstance_delete_post = function(req, res, next) {

  req.checkBody('instanceid', 'Book instance ID must exist').notEmpty(); 

  async.parallel({
    bookinstance: function(callback) {   
      BookInstance.findById(req.body.instanceid).exec(callback);
    }
  }, function(err, results) {
    if (err) {return next(err);}
    //Success. Delete the book instance object and redirect to the list of book instances.
    BookInstance.findByIdAndRemove(
      req.body.instanceid,
      function deleteBookInstance(err) {
        if (err) {return next(err);}
        res.redirect('/catalog/bookinstances');
      }
    );
  });

};

// Display bookinstance update form on GET
exports.bookinstance_update_get = function(req, res, next) {

  req.sanitize('id').escape();
  req.sanitize('id').trim();

  // Get bookinstance for form
  async.parallel({
    bookinstance: function(callback) {
      BookInstance.findById(req.params.id).populate('book').exec(callback);
    },
    books: function(callback) {
      Book.find(callback);
    }
  }, function(err, results) {
    if (err) {return next(err);}
    // Mark selected book as selected
    for (var all_book_iter = 0; all_book_iter < results.books.length; all_book_iter++) {
      if (
        results.books[all_book_iter]._id.toString()
        == results.bookinstance.book._id.toString()
      ) {results.books[all_book_iter].selected = 'true';}
    }
    res.render('bookinstance_form', {
      title: 'Update BookInstance',
      book_list: results.books,
      bookinstance: results.bookinstance
    });
  });

};

// Handle bookinstance update on POST 
exports.bookinstance_update_post = function(req, res, next) {

  //Sanitize id passed in. 
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  //Check other data
  req.checkBody('book', 'Book must be specified').notEmpty();
  req.checkBody('imprint', 'Imprint must be specified').notEmpty();
  req.checkBody('due_back', 'Invalid date').optional({checkFalsy: true}).isDate();
  
  req.sanitize('book').escape();
  req.sanitize('imprint').escape();
  req.sanitize('status').escape();
  req.sanitize('book').trim();
  req.sanitize('imprint').trim();  
  req.sanitize('status').trim();
  // Do not complain about a due date even if the instance is now available.
  req.sanitize('due_back').toDate();

  var bookinstance = new BookInstance({
    book: req.body.book,
    imprint: req.body.imprint, 
    status: req.body.status,
    due_back: req.body.due_back,
    // Prevent assignment of new ID.
    _id: req.params.id
  });

  var errors = req.validationErrors();
  if (errors) {
    // Re-render bookinstance with error information.
    // Get all books for form.
    async.parallel({
      books: function(callback) {
        Book.find(callback);
      }
    }, function(err, results) {
      if (err) {return next(err);}
      // Mark selected book as selected
      for (var all_book_iter = 0; all_book_iter < results.books.length; all_book_iter++) {
        if (
          results.books[all_book_iter]._id.toString()
          == bookinstance.book.toString()
        ) {results.books[all_book_iter].selected = 'true';}
      }
      res.render('bookinstance_form', {
        title: 'Update BookInstance',
        books: results.books,
        book: bookinstance.book,
        bookinstance: bookinstance,
        errors: errors
      });
    });

  } 
  else {
    // Data from form are valid. Update the record.
    BookInstance.findByIdAndUpdate(
      req.params.id,
      bookinstance,
      {},
      function (err, thebookinstance) {
        if (err) {return next(err);}
        // Successful. Redirect to bookinstance detail page.
        res.redirect(thebookinstance.url);
      }
    );
  }

};
