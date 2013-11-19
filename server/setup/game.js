'use strict';

var _ = require('underscore');
var app = require('./express');
var Game = require('../../models/game');

app.game = new Game();

process.on('SIGTERM', _.bind(app.game.stop, app.game));
