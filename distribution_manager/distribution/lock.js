/* eslint-disable no-multiple-empty-lines */
/* eslint-disable space-before-function-paren */
/* eslint-disable semi */


var Redis = require('redis');

var Logging = require('../system/logging');
var Type = require('../system/type');


module.exports = {
  createLockContext: function(redisClient, key, context, cb) {
    ASSERT(Type.isInstanceOf(redisClient, Redis.RedisClient));
    ASSERT(Type.isString(key));
    ASSERT(Type.isObject(context) && ValidateContext(context));
    ASSERT(Type.isFunction(cb));
    return new LockContext(redisClient, key, context, cb);
  }
};


const ASSERT = Logging.assert;
const kDefaultTimeOut = 2;


function LockContext(/* redisClient */ redisClient, /* string */ key,
                     /* object */ context, /* function */ cb) {
  var me = this;
  me.redisClient = redisClient;
  me.key = key;
  me.context = context;
  me.cb = cb;

  me.onSetNXCompleted = function(error, reply) {
    // has error
    if (error) {
      me.cb({
        'result': false,
        'error': error
      });
      return;
    // can't set value.
    } else if (reply <= 0) {
      me.cb({
        'result': false
      });
      return;
    }
    // check returnCode == 1
    // succeed to set.
    if (context.timeout) {
      me.redisClient.expire(key, context.timeout);
    } else {
      me.redisClient.expire(key, kDefaultTimeOut);
    }

    Logging.debug('Aquired lock. owner=', context.owner);
    me.cb({'result': true});
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
      me.redisClient.del(me.key);
    });
  }
}


function ValidateContext(context) {
  if (context['timeout']) {
    if (!Type.isNumber(context.timeout)) {
      return false;
    }
  }
  return true;
}
