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


module.exports = {
  setLoggingLevel: internalSetLoggingLevel,
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  warning: logWarn, /* alias warn */
  error: logError,
  assert: console.assert
}


const kLoggingLevels = { 'DEBUG': 0, 'INFO': 1, 'WARNING': 2, 'ERROR': 3 };
const kColors = {
  'DEBUG': '\x1b[0m',
  'INFO': '\x1b[0m',
  'WARNING': '\x1b[33m',
  'ERROR': '\x1b[31m'
};


var theLoggingLevel = 0;


function isValidLoggingLevel(loggingLevel) {
  var keys = Object.keys(kLoggingLevels);
  return (keys.filter(function(ValidloggingLevel) {
    if (ValidloggingLevel === loggingLevel) {
      return true;
    }
  }).length > 0);
}


function internalSetLoggingLevel(loggingLevel) {
  console.assert(isValidLoggingLevel(loggingLevel));
  theLoggingLevel = kLoggingLevels[loggingLevel];
}


function setLoggingText(level, data) {
  var loggingTextArray = [
    kColors[level], '[', new Date().toLocaleString(), level, ']'].concat(
    Array.from(data));
  return loggingTextArray;
}


function logDebug() {
  if (theLoggingLevel > kLoggingLevels['DEBUG']) {
    return;
  }

  console.info.apply(null, setLoggingText('DEBUG', arguments));
}


function logInfo() {
  if (theLoggingLevel > kLoggingLevels['INFO']) {
    return;
  }

  console.info.apply(null, setLoggingText('INFO', arguments));
}


function logWarn() {
  if (theLoggingLevel > kLoggingLevels['WARNING']) {
    return;
  }

  console.warn.apply(null, setLoggingText('WARNING', arguments));
}


function logError() {
  if (theLoggingLevel > kLoggingLevels['ERROR']) {
    return;
  }

  console.error.apply(null, setLoggingText('ERROR', arguments));
}
