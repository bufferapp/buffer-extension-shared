/* globals self, bufferpm, chrome */
//  buffer-tpc-check.js
//  (c) 2013 Sunil Sadasivan
//  Check if third party cookies are disabled
//

;(function () {

  if (window !== window.top) return;

  ;(function check() {
    //if the 3rd party cookies check is done, remove the iframe
    if((self.port) || (xt && xt.options)) {
      bufferpm.bind("buffer_3pc_done", function(){
        var elem = document.getElementById('buffer_tpc_check');
        if(elem) { elem.parentNode.removeChild(elem); }
        return false;
      });

      //if the 3rd party cookies check is disabled, store it
      bufferpm.bind("buffer_3pc_disabled", function(){
        if(xt && xt.options) {
          xt.options['buffer.op.tpc-disabled'] = true;
        }
        self.port.emit('buffer_tpc_disabled');
        return false;
      });

      var iframe = document.createElement('iframe');
      iframe.id = 'buffer_tpc_check';
      iframe.src = xt.data.get('data/shared/tpc-check.html');
      iframe.style.display="none";
      document.body.appendChild(iframe);
    } else {
      setTimeout(check, 50);
    }
  }());

}());
