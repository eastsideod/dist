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
  has: function(obj, value, filterFunc) {
    if (internalIsObject(obj)) {
      return obj.hasOwnProperty(value);
    } else if (internalIsArray(obj)) {
      if (filterFunc) {
        return (obj.filter(filterFunc).length > 0);
      } else {
        return (obj.filter(function(element) {
          if (element == value) {
            return true;
          }
        }).length > 0);
      }
    } else {
      console.assert(false);
    }
  }
}


function internalIsArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}


function internalIsObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}