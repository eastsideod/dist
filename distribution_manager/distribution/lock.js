module.exports = {
  createLockContext: function(key, context, cb) {
    return new LockContext(undefined, key, context, cb);
  },

};

/*
 *
 * INTERNAL
 *
 */

// import 3rd party
var Redis = require('redis');

// import project lib
var Logging = require('../system/logging');
var Type = require('../system/types');


var ASSERT = Logging.assert;
var DEFAULT_TIMEOUT = 2;


function LockContext(/*redisClient*/ redisClient, /*string*/ key,
                     /*object*/ context, /*function*/ cb) {
  var me = this;
  // me.redisClient = redisClient;
  me.key = key;
  me.context = context;
  me.cb = cb;
  me.redisClient = Redis.createClient(6379, '127.0.0.1');

  me.onSetNXCompleted = function(error, reply) {
    // has error
    if (error) {
      cb({
        'result': false,
        'error': error
      });
      return;
    // can't set value.
    } else if (reply <= 0) {
      cb({
        'result': false,
      });
      return;
    }
    // check returnCode == 1
    // succeed to set.
    if (context.timeout) {
      me.redisClient.expire(key, context.timeout);
    } else {
      me.redisClient.expire(key, DEFAULT_TIMEOUT);
    }

    Logging.debug('Aquired lock. owner=', context.owner);
    cb({'result': true});
  }

  me.lock = function() {
    if (!me.context.owner) {
      // TODO(inkeun): raise error
    }
    me.redisClient.setnx(key, JSON.stringify(context), me.onSetNXCompleted);
  }

  me.unlock = function() {
    me.redisClient.get(me.key, function(error, data) {
      if (error) {
        ASSERT(false, 'Failed to unlock.');
      }
      console.log(data);
      me.redisClient.del(me.key);
    });
  }
}