/* globals key */

// requires keymaster.js

;(function () {
    // Wait for xt.options to be set
  ;(function check() {
    // If hotkey is switched on, add the buttons
    if( xt.options && xt.options['buffer.op.key-enable'] === 'key-enable') {
      key(xt.options['buffer.op.key-combo'], function () {
        var usesDefaultShortcut = xt.options['buffer.op.key-combo'] === 'alt+b';
        var isShortcutPressedInBufferApp = /https?:\/\/buffer.com\/app\//.test(location.href);
        if (usesDefaultShortcut && isShortcutPressedInBufferApp) {
          return false; // Buffer.com already offers the alt+b shortcut to open the in-app composer
        }

        xt.port.emit("buffer_click", {placement: 'hotkey'});
        return false;
      });
    } else {
      setTimeout(check, 50);
    }
  }());
}());
