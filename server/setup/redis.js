'use strict';

var _ = require('underscore');
var config = require('../config');
var redis = require('redis');
var url = require('url');

// Extract connection info from the url.
var parsed = url.parse(config.redis.url);
var port = parsed.port;
var host = parsed.hostname;
var auth = parsed.auth ? parsed.auth.split(':') : [];
var password = auth[1];
var db = (parsed.path || '').slice(1);

// Override createClient to create clients pre-configured for our app.
var clients = {};
var createClient = redis.createClient;
redis.createClient = function () {
  var client = createClient.call(redis, port, host, config.redis);
  if (password) client.auth(password);
  if (db) client.select(db);
  var id = _.uniqueId();
  clients[id] = client;
  client.on('end', function () { delete clients[id]; });
  return client;
};

redis.client = redis.createClient();

process.on('SIGTERM', _.bind(_.invoke, _, clients, 'quit'));
