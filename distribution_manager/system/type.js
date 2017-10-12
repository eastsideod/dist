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
 * Type System Class
 *
 * Author: Inkeun.kim(eastsideod@gmail.com)
 *
 */

/* DISABLE LINTS */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable space-before-function-paren */
/* eslint-disable semi */


var Logging = require('./logging');


const ASSERT = Logging.assert;


module.exports = {
  isInteger: function(value) {
    return Number.isInteger(value);
  },
  isString: function(value) {
    return typeof value === 'string';
  },
  isArray: function(value) {
    return internalIsArray(value);
  },
  isObject: function(value) {
    return internalIsObject(value);
  },
  isFunction: function(value) {
    return typeof value === 'function';
  },
  isNumber: function(value) {
    return !Number.isNaN(value);
  },
  isInstanceOf: function(obj, cls) {
    return obj instanceof cls;
  },
  has: function(obj, value, filterFunc) {
    if (internalIsObject(obj)) {
      return obj.hasOwnProperty(value);
    } else if (internalIsArray(obj)) {
      if (filterFunc) {
        return (obj.filter(filterFunc).length > 0);
      } else {
        return (obj.filter(function(element) {
          if (element === value) {
            return true;
          }
        }).length > 0);
      }
    }
    return false;
  },
  copy: function(obj) {
    ASSERT(internalIsObject(obj));
    // TODO(inkeun): 교체 알고리즘 변경, function등의 개체를 stringify 되지 않는
    // 것도 가리키는 것도 복사할 수 있게 한다
    return JSON.parse(JSON.stringify(obj));
  }
}


function internalIsArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}


function internalIsObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}
