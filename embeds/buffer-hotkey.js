//     keymaster.js
//     (c) 2011 Thomas Fuchs
//     keymaster.js may be freely distributed under the MIT license.
(function(a){function h(a,b){var c=a.length;while(c--)if(a[c]===b)return c;return-1}function i(a){var b,g,i,j,k;b=a.keyCode;if(b==93||b==224)b=91;if(b in d){d[b]=!0;for(i in f)f[i]==b&&(l[i]=!0);return}if(!l.filter.call(this,a))return;if(!(b in c))return;for(j=0;j<c[b].length;j++){g=c[b][j];if(g.scope==e||g.scope=="all"){k=g.mods.length>0;for(i in d)if(!d[i]&&h(g.mods,+i)>-1||d[i]&&h(g.mods,+i)==-1)k=!1;(g.mods.length==0&&!d[16]&&!d[18]&&!d[17]&&!d[91]||k)&&g.method(a,g)===!1&&(a.preventDefault?a.preventDefault():a.returnValue=!1,a.stopPropagation&&a.stopPropagation(),a.cancelBubble&&(a.cancelBubble=!0))}}}function j(a){var b=a.keyCode,c;if(b==93||b==224)b=91;if(b in d){d[b]=!1;for(c in f)f[c]==b&&(l[c]=!1)}}function k(){for(b in d)d[b]=!1;for(b in f)l[b]=!1}function l(a,b,d){var e,h,i,j;d===undefined&&(d=b,b="all"),a=a.replace(/\s/g,""),e=a.split(","),e[e.length-1]==""&&(e[e.length-2]+=",");for(i=0;i<e.length;i++){h=[],a=e[i].split("+");if(a.length>1){h=a.slice(0,a.length-1);for(j=0;j<h.length;j++)h[j]=f[h[j]];a=[a[a.length-1]]}a=a[0],a=g[a]||a.toUpperCase().charCodeAt(0),a in c||(c[a]=[]),c[a].push({shortcut:e[i],scope:b,method:d,key:e[i],mods:h})}}function m(a){var b=(a.target||a.srcElement).tagName;return b!="INPUT"&&b!="SELECT"&&b!="TEXTAREA"}function n(a){e=a||"all"}function o(){return e||"all"}function p(a){var b,d,e;for(b in c){d=c[b];for(e=0;e<d.length;)d[e].scope===a?d.splice(e,1):e++}}function q(a,b,c){a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent&&a.attachEvent("on"+b,function(){c(window.event)})}var b,c={},d={16:!1,18:!1,17:!1,91:!1},e="all",f={"⇧":16,shift:16,"⌥":18,alt:18,option:18,"⌃":17,ctrl:17,control:17,"⌘":91,command:91},g={backspace:8,tab:9,clear:12,enter:13,"return":13,esc:27,escape:27,space:32,left:37,up:38,right:39,down:40,del:46,"delete":46,home:36,end:35,pageup:33,pagedown:34,",":188,".":190,"/":191,"`":192,"-":189,"=":187,";":186,"'":222,"[":219,"]":221,"\\":220};for(b=1;b<20;b++)f["f"+b]=111+b;for(b in f)l[b]=!1;q(document,"keydown",i),q(document,"keyup",j),q(window,"focus",k),a.key=l,a.key.setScope=n,a.key.getScope=o,a.key.deleteScope=p,a.key.filter=m,typeof module!="undefined"&&(module.exports=key)})(this);

;(function () {
    
    // Wait for xt.options to be set
  ;(function check() {
    // If hotkey is switched on, add the buttons
    if( xt.options && xt.options['buffer.op.key-enable'] === 'key-enable') {
      key( xt.options['buffer.op.key-combo'], function () {
        xt.port.emit("buffer_click", {placement: 'hotkey'});
        return false;
      });
    } else {
      setTimeout(check, 50);
    }
  }()); 
    
}());
