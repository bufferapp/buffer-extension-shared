let iframe;

function initFrame() {
  iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
}

// Listen to the parent window send src info to be set on the nested frame
function receiveNestedFrameData() {
  const handler = (e) => {
    if (e.source !== window.parent && !e.data.src) return;

    iframe.src = e.data.src;
    window.removeEventListener('message', handler);
  };

  window.addEventListener('message', handler);
}

// Listen to messages from nested frame and pass them up the window stack
function setupMessageRelay() {
  window.addEventListener('message', (e) => {
    const origin = e.origin || e.originalEvent.origin;
    if (origin !== 'https://buffer.com' || e.source !== iframe.contentWindow) {
      return;
    }

    window.parent.postMessage(e.data, '*');
  });
}

initFrame();
receiveNestedFrameData();
setupMessageRelay();
