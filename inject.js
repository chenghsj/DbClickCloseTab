const init = function () {
  let handleDblclick = function () {
    chrome.runtime.sendMessage({ closeTab: true });
  };
  window.addEventListener("auxclick", makeDoubleClick(handleDblclick), false);

  function makeDoubleClick(cb) {
    //https://stackoverflow.com/questions/46812360/how-to-detect-double-click-on-element-by-registering-only-click-event
    var clicks = 0,
      timeout;
    return function () {
      clicks++;
      if (clicks == 1) {
        timeout = setTimeout(function () {
          clicks = 0;
        }, 400);
      } else {
        timeout && clearTimeout(timeout);
        cb && cb();
        clicks = 0;
      }
    };
  }
};
init();
