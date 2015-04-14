var express = require('express');
var when = require('when');
var SDCClient = require('../clients/sdc.js');
var subapp = express();

/**
 * JSON API
 */

/*
 * Get list of machines for a user
 */
subapp.get('/machines', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var client = new SDCClient();

  var user = req.query.user;
  if (user === undefined) {
    return res
      .status('400')
      .end('paramater user is required');
  }

  // TODO(schoon) - Auth.

  client
    .getMachines(user)
    .then(function(machineList) {
      return res
        .status('200')
        .send(JSON.stringify({ machines: machineList }));
    }, function (err) {
      return res
        .status(500)
        .send(err.message)
    });
});

subapp.get('/machines/:id', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var client = new SDCClient();

  var user = req.query.user;
  if (user === undefined) {
    return res
      .status('400')
      .end('paramater user is required');
  }

  var dataCenter = req.query.dataCenter;
  if (dataCenter === undefined) {
    return res
      .status('400')
      .end('dataCenter is required');
  }

  // TODO(schoon) - Auth.

  client
    .getMachine(user, dataCenter, req.params.id)
    .then(function(machine) {

      return res
        .status('200')
        .send(JSON.stringify(machine));
    });
});

/*
 * Deprecate
 */
subapp.get('/machines/states', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var client = new SDCClient();

  var user = req.query.user;
  if (user === undefined) {
    return res
      .status('400')
      .end('paramater user is required');
  }

  // TODO(schoon) - Auth.

  statuses = [];
  client
    .getMachines(user)
    .then(function(machineList) {
      machineList.forEach(function(machine) {
        statuses.push({ id: machine.id, state: machine.state });
      });

      return res
        .status('200')
        .send(JSON.stringify(statuses));
    });
});

subapp.post('/machines/:id/reboot', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var user = req.query.user;
  if (user === undefined) {
    return res
      .status('400')
      .end('paramater user is required');
  }

  // TODO(schoon) - Auth.

  var dataCenter = req.body.dataCenter;
  if (dataCenter === undefined) {
    return res
      .status('400')
      .end('dataCenter is required');
  }

  var client = new SDCClient();
  var machineId = req.params.id;

  client
    .getMachine(user, dataCenter, machineId)
    .then(function (machine) {

      if (machine === undefined || machine.state !== 'running') {
        return res
          .status('400')
          .end('machine can only be started if in state \'running\'');
      }

      client
        .rebootMachine(user, dataCenter, machineId)
        .then(function() {
          return res
            .status('202')
            .end();
        });
    });
});

subapp.post('/machines/:id/start', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var user = req.query.user;
  if (user === undefined) {
    return res
      .status('400')
      .end('paramater user is required');
  }

  var dataCenter = req.body.dataCenter;
  if (dataCenter === undefined) {
    return res
      .status('400')
      .end('dataCenter is required');
  }

  // TODO(schoon) - Auth.

  var client = new SDCClient();
  var machineId = req.params.id;

  client
    .getMachine(user, dataCenter, machineId)
    .then(function (machine) {

      if (machine === undefined || machine.state !== 'stopped') {
        return res
          .status('400')
          .end('machine can only be started if in state \'stopped\'');
      }

      console.log('hiii');
      client
        .startMachine(user, dataCenter, machineId)
        .then(function() {
          return res
            .status('202')
            .end();
        });
    });

});

/*
 * Get list of users currently signed in user has access to.
 */
subapp.get('/users', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var users = ['Amber', 'CoreServices'];

  return res
    .status('200')
    .send(JSON.stringify({users: users}));
});

module.exports = subapp;
