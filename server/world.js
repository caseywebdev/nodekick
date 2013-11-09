'use strict';

var app = require('.');
var config = require('./config');

var world = app.world = exports;

world.state = [];

world.tick = function () {
  world.state.forEach(function (i, u) {
    // do work
  });
};

world.start = function () {
  if (world.running) {
    console.error('game already running!');
  } else {
    world.running = setInterval(world.tick, config.world.updateRate);
  }
};

world.stop = function () {
  if (!world.running) {
    console.error('game not currently running!');
  } else {
    clearInterval(world.running);
  }
};