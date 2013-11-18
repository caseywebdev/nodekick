'use strict';

var _ = require('underscore');
var http = require('http');

module.exports = function (er, req, res, next) {
  var status = _.isNumber(er) ? er : er.status ? er.status : 500;

  // Log interesting errors.
  if (status === 500) console.error((er.stack || er).error);

  // Get the status code associated with the error.
  var message = http.STATUS_CODES[status] || http.STATUS_CODES[status = 500];

  // Return an error message, taking the accepts header into account.
  var accept = req.accepts(['html', 'json']);
  if (!accept) return res.send(status);
  if (accept === 'json') return res.send(status, {error: message});
  res.render('pages/_error', {
    status: status,
    message: message
  }, function (er, html) {
    if (er) return next(er);
    res.send(status, html);
  });
};
