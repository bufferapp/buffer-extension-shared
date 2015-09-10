// This script is meant to run in the overlay's /add only
var shouldRun = (window.location.hostname + window.location.pathname).indexOf('buffer.com/add') != -1;

if (shouldRun) {
  // Grab a subset of user data specifically made available for the needs of the extension, and
  // send that over to the background script
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/ajax/extensionUserInfo');
  xhr.onload = function() {
    var extensionUserInfo = JSON.parse(xhr.responseText);
    xt.port.emit('buffer_user_data', extensionUserInfo);
  };
  xhr.send(null);
}
