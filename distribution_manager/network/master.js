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

var Server = require('.server');
var Logging = require('../system/logging');
var Type = require('../system/type');


module.exports = {
  create: function() {
    ASSERT(!theMasterNode);
    theMasterNode = new MasterNode();
  },

  get: function() {
    ASSERT(theMasterNode);
    return theMasterNode;
  },
  /*
    NOTE(inkeun): 아래에 존재하는 모든 API는 모두 locking 및 단일 실행 작업을
    보증해야한다.
    node js 구현체에서는 신경 쓸 필요가 없으나 추후 포팅 시 신경을 써야한다.
  */

  // TODO(inkeun): 두번째 인자는 client로 교체
  lock: function(/* string */ key, /* string(uuid) */ owner,
                 /* int */ duration) {
    ASSERT(theMasterNode);
    ASSERT(Type.isString(key));
    ASSERT(Type.isString(owner));

    var success = false;
    var obj = {};
    obj[kOwner] = owner;
    obj[kKey] = key;
    obj[kTimestamp] = new Date().getTime();

    if (duration) {
      ASSERT(Type.isInteger(duration));
      obj[kDuration] = duration;
    } else {
      obj[kDuration] = kDefaultLockDuration;
    }

    {
      success = theMasterNode.keyValueStorage.writeIfNotExists(
          key, JSON.stringify(obj));
    }

    if (success) {
      theMasterNode.keyValueStorage.setExpire(obj[kDuration]);
    }

    return success;
  },

  unlock: function(/* string */ key, /* string(uuid) */ owner) {
    ASSERT(Type.isString(key));
    ASSERT(Type.isString(owner));
  },

  watch: function(/* string */ key, /* string */ watcherName,
                  /* function */ watcher) {
    ASSERT(theMasterNode);
    ASSERT(Type.isString(key));
    ASSERT(Type.isString(watcherName));
    ASSERT(Type.isFunction(watcher));
    theMasterNode.keyValueStorage.addWatcher(key, watcherName, watcher);
  },

  unwatch: function(/* string */ key, /* string */ watcherName) {
    ASSERT(theMasterNode);
    ASSERT(Type.isString(key));
    ASSERT(Type.isString(watcherName));
    theMasterNode.keyValueStorage.removeWatcher(key, watcherName);
  }
};


const ASSERT = Logging.assert;

const kOwner = 'owner';
const kKey = 'key';
const kTimestamp = 'timestamp';
const kDuration = 'duration';
const kDefaultLockDuration = 5000;


var theMasterNode;


function MasterNode() {
  var me = this;

  me.rawServer = undefined;
  me.keyValueStorage = new KeyValueStorage();

  me.onConnected = function() {
  };

  me.start = function(config) {
    ASSERT(Type.isObject(config));
    me.rawServer = Server.create(config);
    ASSERT(me.rawServer);

    Logging.Info('Master node started. config=', config);
    me.rawServer.start();
  };
}


function KeyValueStorage() {
  var me = this;

  me.storage = {};
  me.expireTimers = {};
  me.watchers = {};
  me.recordTimestamps = {};

  me.write = function(/* string */ key, /* string */ data) {
    me.storage[key] = data;
    me.recordTimestamps[key] = new Date().getTime();
  };

  me.read = function(/* string */ key) {
    return me.storage[key];
  };

  me.writeIfNotExists = function(/* string */ key, /* string */ data) {
    if (me.storage[key]) {
      return false;
    }
    me.write(key, data);
    return true;
  };

  me.delete = function(/* string */ key) {
    // 삭제시 반드시 expire timer를 검사한다.
    if (me.expireTimers[key]) {
      clearTimeout(me.expireTimers[key]);
      me.expireTimers[key] = undefined;
    }
    me.storage[key] = undefined;
  };

  me.setExpire = function(/* string */ key, /* int */ duration) {
    // 중복 타이머가 동작되는 경우는 없어야 한다.
    ASSERT(!me.expireTimers[key]);
    me.expireTimers[key] = setTimeout(function() {
      me.delete(key);
    }, duration);
  };

  me.addWatcher = function(/* string */ key, /* string */ watcherName,
                           /* function */ watcher) {
    if (!me.watchers[key]) {
      me.watchers = {};
    }

    ASSERT(!me.watchers[key][watcherName]);
    me.watchers[key][watcherName] = watcher;
  };

  me.removeWatcher = function(/* string */ key, /* string */ watcherName) {
    ASSERT(me.watchers[key]);
    ASSERT(me.watchers[key][watcherName]);
    me.watchers[key][watcherName] = undefined;
  };

  me.getRecordTimestamp = function(/* string */ key) {
    return me.recordTimestamps[key];
  }

  me.setRecordTimestamp = function(/* string */ key, /* int */ timestamp) {
    me.recordTimestamps[key] = timestamp;
  }
}


function DiretoryStorage() {

  function FileNode(/* string */ name) {
    var me = this;
    me.name = name;
  }

  function DirectoryNode(/* string */ name) {
    var me = this;
    me.name = name;
    me.childrens = {};
    me.hierachy = {};

    me.addDirectory = function(/* string */ key) {
      ASSERT(!me.childrens[key]);
    };

    me.has = function(/* string */ key) {
      return (me.childrens[key] !== undefined);
    };
  }


  var me = this;

  me.directories = {};
  me.addDirectory = function(/* string */ key) {
    ASSERT(!me.directories[key]);
  };
}
