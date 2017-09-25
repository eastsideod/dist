//
// Copyright 2017 distribution manager team.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

module.exports = {
  createServerSocket: function(config) {
    return new ServerSocket(config);
  },

  createClientSocket: function(config) {
    return new ClientSocket(config);
  }
};


var Net = require('net');
var DEBUG = console.log;
var ERROR = console.error;
var ASSERT = console.assert;

function EMPTY_FUNCTION() {}

function ServerSocket(config) {
  var me = this;
  me.config = config;
  me.rawServer = undefined;

  me.events = {
    'onConnected': EMPTY_FUNCTION,
    'onReceived': EMPTY_FUNCTION,
    'onDisconected': EMPTY_FUNCTION
  };

  me.onConnected = function(client) {

    me.events.onConnected(client);
    client.on('data', function(data) {
      me.events.onReceived(client, data);
    });
  }

  me.onListened = function() {
    DEBUG('listening started. port=', me.config.port);
  }

  me.listen = function() {
    try {
      // me.config.port
      me.rawServer = Net.createServer(me.onConnected);
      ASSERT(me.rawServer);
      me.rawServer.listen(me.config.port, me.onListened);

    } catch (error) {
      ERROR('listen error. reason=', error);
    }
  }
}


function ClientSocket(config) {
  var me = this;
  me.config = config;
  me.rawClient = undefined;

  me.events = {
    'onConnected': EMPTY_FUNCTION,
    'onReceived': EMPTY_FUNCTION,
    'onErrorOccured': EMPTY_FUNCTION,
  };

  me.connect = function() {
    me.rawClient = Net.connect(config);
    me.rawClient.on('connect', me.events.onConnected);
    me.rawClient.on('data', me.events.onReceived);
    me.rawClient.on('error', onErrorOccured);
  }
}