(function () {
  try {
    if (typeof window === "undefined") return;
    var proto = window.Window ? window.Window.prototype : Object.getPrototypeOf(window);
    var desc =
      Object.getOwnPropertyDescriptor(window, "fetch") ||
      (proto && Object.getOwnPropertyDescriptor(proto, "fetch"));
    if (!desc || !desc.set || !desc.writable) {
      var orig = window.fetch ? window.fetch.bind(window) : null;
      var current = orig;
      Object.defineProperty(window, "fetch", {
        configurable: true,
        enumerable: true,
        get: function () {
          return current;
        },
        set: function (fn) {
          current = fn;
        },
      });
    }
  } catch (e) {
    console.warn("[FetchGuard]", e);
  }
})();
