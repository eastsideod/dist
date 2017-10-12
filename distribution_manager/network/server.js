/*
 * Copyright 2017 The Distribution Manager Project
 *
 * The Distribution Manager Project licenses this file to you under the
 * Apache License, version 2.0 (the "License"); you may not use this file
 * except in compliance with the License.
 * You may obtain a copy of the License at:
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 *
 * Network Socket
 *
 * Author: Inkeun.kim(eastsideod@gmail.com)
 *
 */

/* DISABLE LINTS */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable space-before-function-paren */
/* eslint-disable semi */


var Net = require('net');
var Uuid = require('uuid/v4');

var Logging = require('../system/logging');
var Type = require('../system/type');


module.exports = {
  create: function(config) {
    return new Server(config);
  },

  findClient: function(uuid) {
    return theClientMap[uuid];
  }
};


const ASSERT = Logging.assert;


function EMPTY_FUNCTION() {}
const kDefaultServerEvents = {
  'onConnected': EMPTY_FUNCTION,
  'onReceived': EMPTY_FUNCTION,
  'onDisconected': EMPTY_FUNCTION
};


var theClientMap = {};


function Server(config) {
  var me = this;
  me.config = config;
  me.rawSocket = undefined;

  me.events = kDefaultServerEvents;
  me.onConnected = function(socket) {
    // TODO(inkeun): 다른 매니저 서버인지 확인하는 것은 추후에 추가하고
    // 우선은 다 클라이언트로 본다.
    var uuid = Uuid();
    var client = new Client(uuid, socket);
    ASSERT(uuid && client);
    theClientMap[uuid] = client;
    Logging.debug('client connected. id=', uuid);
    me.events.onConnected(client);
    socket.on('data', function(data) {
      Logging.debug('received data. data=', data.toString());
      socket.write(data);
      me.events.onReceived(client, data);
    });
  };

  me.onListened = function() {
    Logging.debug('listening started. port=', me.config.port);
  };

  me.onErrorOccured = function(error) {
    Logging.debug('error occured. error=', error);
  };

  me.listen = function() {
    try {
      me.rawSocket = Net.createServer(me.onConnected);
      ASSERT(me.rawSocket);
      me.rawSocket.on('error', me.onErrorOccured);
      me.rawSocket.listen(me.config.port, me.onListened);
    } catch (error) {
      Logging.error('listen ERROR. reason=', error);
    }
  };
}


function Client(uuid, socket) {
  var me = this;
  me.uuid = uuid;
  me.socket = socket;
  me.lastMessageReceivedTime = undefined;
}
