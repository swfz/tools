let timerId = null;
let count = 0;
let interval = 1000;

self.onmessage = function (event) {
  const { command, payload } = event.data;

  if (command === 'start') {
    if (timerId) return;

    count = payload?.count;
    interval = payload?.interval || 1000;

    timerId = setInterval(() => {
      count -= 1;

      self.postMessage({ type: 'tick', count });

      if (count <= 0) {
        clearInterval(timerId);
        timerId = null;
        self.postMessage({ type: 'done', count: 0 });
      }
    }, interval);
  }

  if (command === 'pause') {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  if (command === 'resume') {
    if (!timerId) {
      timerId = setInterval(() => {
        count -= 1;

        if (count <= 0) {
          clearInterval(timerId);
          timerId = null;
          self.postMessage({ type: 'done', count });
        } else {
          self.postMessage({ type: 'tick', count });
        }
      }, interval);
    }
  }

  if (command === 'reset') {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }

    count = 0;
    self.postMessage({ type: 'reset', count });
  }
};
