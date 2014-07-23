(function () {
	'use strict';

	var isCommonjs = typeof module !== 'undefined' && module.exports;
	var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;

  var sendF11 = function () {
    var wscript = new ActiveXObject('WScript.Shell');
    if (wscript !== null) {
      wscript.SendKeys('{F11}');
    }
  };

	var fn = (function () {
		var val;
		var valLength;

		var fnMap = [
			[
				'requestFullscreen',
				'exitFullscreen',
				'fullscreenElement',
				'fullscreenEnabled',
				'fullscreenchange',
				'fullscreenerror'
			],
			// new WebKit
			[
				'webkitRequestFullscreen',
				'webkitExitFullscreen',
				'webkitFullscreenElement',
				'webkitFullscreenEnabled',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			// old WebKit (Safari 5.1)
			[
				'webkitRequestFullScreen',
				'webkitCancelFullScreen',
				'webkitCurrentFullScreenElement',
				'webkitCancelFullScreen',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			[
				'mozRequestFullScreen',
				'mozCancelFullScreen',
				'mozFullScreenElement',
				'mozFullScreenEnabled',
				'mozfullscreenchange',
				'mozfullscreenerror'
			],
			[
				'msRequestFullscreen',
				'msExitFullscreen',
				'msFullscreenElement',
				'msFullscreenEnabled',
				'MSFullscreenChange',
				'MSFullscreenError'
			]
		];

		var i = 0;
		var l = fnMap.length;
		var ret = {};

		for (; i < l; i++) {
			val = fnMap[i];
			if (val && val[1] in document) {
				for (i = 0, valLength = val.length; i < valLength; i++) {
					ret[fnMap[0][i]] = val[i];
				}
				return ret;
			}
		}

    if (typeof window.ActiveXObject !== 'undefined') {
      return {
        requestFullscreen: function (screenfull) {
          sendF11();
          screenfull.isFullscreen = true;
        },
        exitFullscreen: function (screenfull) {
          sendF11();
          screenfull.isFullscreen = false;
        }
      };
    }
		return false;
	})();

	var screenfull = {
		request: function (elem) {
			var request = fn.requestFullscreen;
      if (typeof request === 'function') {
        request(this);
      } else {
        elem = elem || document.documentElement;

        // Work around Safari 5.1 bug: reports support for
        // keyboard in fullscreen even though it doesn't.
        // Browser sniffing, since the alternative with
        // setTimeout is even worse.
        if (/5\.1[\.\d]* Safari/.test(navigator.userAgent)) {
          elem[request]();
        } else {
          elem[request](keyboardAllowed && Element.ALLOW_KEYBOARD_INPUT);
        }
      }
		},
		exit: function () {
      var exit = fn.exitFullscreen;
      if (typeof exit === 'function') {
        exit(this);
      } else {
        document[fn.exitFullscreen]();
      }
		},
		toggle: function (elem) {
			if (this.isFullscreen) {
				this.exit();
			} else {
				this.request(elem);
			}
		},
		onchange: function () {},
		onerror: function () {},
		raw: fn
	};

	if (!fn) {
		if (isCommonjs) {
			module.exports = false;
		} else {
			window.screenfull = false;
		}

		return;
	}

  if (typeof Object.defineProperties !== 'undefined') {
    Object.defineProperties(screenfull, {
      isFullscreen: {
        get: function () {
          return !!document[fn.fullscreenElement];
        }
      },
      element: {
        enumerable: true,
        get: function () {
          return document[fn.fullscreenElement];
        }
      },
      enabled: {
        enumerable: true,
        get: function () {
          // Coerce to boolean in case of old WebKit
          return !!document[fn.fullscreenEnabled];
        }
      }
    });
  }

  if (typeof document.addEventListener !== 'undefined') {
    document.addEventListener(fn.fullscreenchange, function (e) {
      screenfull.onchange.call(screenfull, e);
    });

    document.addEventListener(fn.fullscreenerror, function (e) {
      screenfull.onerror.call(screenfull, e);
    });
  }

	if (isCommonjs) {
		module.exports = screenfull;
	} else {
		window.screenfull = screenfull;
	}
})();
