/*
  Bruce's project
  Copyright (c) 2021 brucehe<bruce.he.62@gmail.com>
  
  See LICENSE.txt for more information
*/


// get/set/delete (key, value) pair to localStorage
export function getConfig(key, defaultValue) {
  if (key) {
    const dataString = window.localStorage?.getItem(key);
    if (dataString) {
      return JSON.parse(dataString);
    }
  }
  return defaultValue;
}

export function setConfig(key, value) {
  if (key && value !== undefined && value !== null) {
    window.localStorage?.setItem(key, JSON.stringify(value));
  }
}

export function removeConfig(key) {
  if (key) {
    window.localStorage?.removeItem(key);
  }
}

const config = getConfig("config", {
  serverUrl: "http://localhost",
});

export default config;
