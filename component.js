/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
  "troopjs-core/component/emitter",
  "./config",
  "./executor",
  "./error",
  "troopjs-compose/decorator/before",
  "jquery",
  "when/when",
  "mu-selector-set/main",
  "mu-jquery-destroy/main"
], function (Component, config, executor, DOMError, before, $, when, SelectorSet) {
  "use strict";

  /**
   * Component that manages all DOM manipulation and integration.
   * @class dom.component
   * @extend core.component.emitter
   * @mixin dom.config
   * @alias feature.component
   */

  var UNDEFINED;
  var NULL = null;
  var OBJECT_TOSTRING = Object.prototype.toString;
  var TOSTRING_FUNCTION = "[object Function]";
  var $ELEMENT = "$element";
  var LENGTH = "length";
  var PROXY = "proxy";
  var DOM = "dom";
  var ARGS = "args";
  var NAME = "name";
  var VALUE = "value";
  var TYPE = config.emitter.type;
  var EXECUTOR = config.emitter.executor;
  var SCOPE = config.emitter.scope;
  var DATA = config.emitter.data;
  var DIRECT = "direct";
  var DELEGATED = "delegated";
  var SIG_RENDER = config.signal.render;
  var RE = new RegExp("^" + DOM + "/(.+)");

  function $render ($element, method, args) {
    var me = this;
    var length = args[LENGTH];

    return when(args[0], function (content) {
      var _length;
      var _args;

      // If `content` is a string we can return fast
      if (OBJECT_TOSTRING.call(content) !== TOSTRING_FUNCTION) {
        return content;
      }

      // Initialize `_length` and `_args`
      _length = length;
      _args = new Array(_length - 1);

      // Copy `args` to `_args`
      while (_length-- > 1) {
        _args[_length - 1] = args[_length];
      }

      // Return result of applying `content` on `$element` with `_args`
      return content.apply($element, _args);
    })
    .then(function (content) {
      // Initialize `_length`, `_args` and `__args`
      var _length = length;
      var _args = new Array(_length);
      var __args = new Array(_length + 1);

      // Let `__args[0]` be `SIG_RENDER`
      __args[0] = SIG_RENDER;

      // Copy `args` to `_args`
      // Copy `args` to `__args` with offset
      while (_length--) {
        _args[_length] = __args[_length + 1] = args[_length];
      }

      // Determine manipulation method and result
      switch (method) {
        case "appendTo":
        case "prependTo":
          _args[0] = __args[1] = $(content)[method]($element);
          break;

        case "text":
          _args[0] = __args[1] = $element[method](content).contents();
          break;

        default:
          _args[0] = __args[1] = $element[method](content).children();
      }

      // Emit `__args`
      // Yield `_args`
      return me.emit
        .apply(me, __args)
        .yield(_args);
    });
  }

  /**
   * Render signal
   * @event sig/render
   * @localdoc Triggered after {@link #before}, {@link #after}, {@link #html}, {@link #text}, {@link #append}, {@link #appendTo}, {@link #prepend} and {@link #prependTo}
   * @since 3.0
   * @param {jQuery} $target Element rendered into
   * @param {...*} [args] Render arguments
   */

  /**
   * Handles component render
   * @handler sig/render
   * @template
   * @inheritdoc #event-sig/render
   * @return {Promise}
   */

  /**
   * Destroy DOM event
   * @localdoc Triggered when {@link #$element} of this widget is removed from the DOM tree.
   * @event dom/destroy
   * @param {jQuery} $event jQuery event object
   * @param {...*} [args] Event arguments
   * @preventable
   */

  /**
   * Handles widget destruction from a DOM perspective
   * @handler dom/destroy
   * @template
   * @inheritdoc #event-dom/destroy
   * @localdoc Triggered when this widget is removed from the DOM
   */

  /**
   * Renders content and replaces {@link #$element} html contents
   * @method html
   * @param {Function|String|Promise} [contentOrPromise] Contents to render or a Promise for contents
   * @param {...*} [args] Template arguments
   * @fires sig/render
   * @return {String|Promise} The returned content string or promise of rendering.
   */

  /**
   * Renders content and replaces {@link #$element} text contents
   * @method text
   * @inheritdoc #html
   * @fires sig/render
   */

  /**
   * Renders content and inserts it before {@link #$element}
   * @method before
   * @inheritdoc #html
   * @fires sig/render
   * @return {Promise} The promise of rendering.
   */

  /**
   * Renders content and inserts it after {@link #$element}
   * @method after
   * @inheritdoc #html
   * @fires sig/render
   */

  /**
   * Renders content and appends it to {@link #$element}
   * @method append
   * @inheritdoc #html
   * @fires sig/render
   */

  /**
   * Renders content and appends it to the provided $element
   * @method appendTo
   * @param {jQuery} $element Target element
   * @param {Function|String|Promise} [contentOrPromise] Contents to render or a Promise for contents
   * @param {...*} [args] Template arguments
   * @fires sig/render
   * @return {Promise} The promise of rendering.
   */

  /**
   * Renders content and prepends it to {@link #$element}
   * @method prepend
   * @inheritdoc #html
   * @fires sig/render
   */

  /**
   * Renders content and prepends it to the provided $element
   * @method prependTo
   * @inheritdoc #appendTo
   * @fires sig/render
   */
  /**
   * Creates a new component that attaches to a specified (jQuery) DOM element.
   * @method constructor
   * @param {jQuery|HTMLElement} $element The element that this component should be attached to
   * @param {String} [displayName] A friendly name for this component
   * @throws {dom.error} If no $element is provided
   */
  return Component.extend(
    function ($element, displayName) {
      var me = this;
      var length = arguments[LENGTH];
      var args = new Array(length);
      var $get;

      // No $element
      if ($element === UNDEFINED || $element === NULL) {
        throw new DOMError("No '$element' provided");
      }

      // Let `args` be `ARRAY_SLICE.call(arguments)` without deop
      while (length-- > 0) {
        args[length] = arguments[length];
      }

      // Is _not_ a jQuery element
      if (!$element.jquery) {
        // Let `$element` be `$($element)`
        // Let `args[0]` be `$element`
        args[0] = $element = $($element);
      }
      // From a different jQuery instance
      else if (($get = $element.get) !== $.fn.get) {
        // Let `$element` be `$($get.call($element, 0))`
        // Let `args[0]` be `$element`
        args[0] = $element = $($get.call($element, 0));
      }

      /**
       * jQuery element this widget is attached to
       * @property {jQuery} $element
       * @readonly
       */
      me[$ELEMENT] = $element;

      // Update `me.displayName` if `displayName` was supplied
      if (displayName !== UNDEFINED) {
        me.displayName = displayName;
      }

      // Return potentially modified `args`
      return args;
    },

    {
      "displayName": "dom/component",

      /**
       * @handler
       * @localdoc Registers event handlers that are declared as DOM specials.
       * @inheritdoc
       */
      "sig/initialize": function () {
        var me = this;
        var specials = me.constructor.specials;

        if (specials.hasOwnProperty(DOM)) {
          specials[DOM].forEach(function (special) {
            var args;

            if ((args = special[ARGS]) !== UNDEFINED && args[LENGTH] > 0) {
              me.on.apply(me, [ special[NAME], special[VALUE] ].concat(special[ARGS]));
            }
            else {
              me.on(special[NAME], special[VALUE]);
            }
          });
        }
      },

      /**
       * @handler
       * @localdoc Registers DOM event proxies on {@link #$element}.
       * @inheritdoc
       */
      "sig/setup": function (handlers, type) {
        var me = this;
        var matches;

        // Check that this is a DOM handler
        if ((matches = RE.exec(type)) !== NULL) {
          // Create delegated and direct event stores
          handlers[DIRECT] = [];
          handlers[DELEGATED] = new SelectorSet();

          // `$element.on` `handlers[PROXY]`
          me[$ELEMENT].on(matches[1], NULL, me, handlers[PROXY] = function () {
            var length = arguments[LENGTH];
            var args = new Array(length + 1);
            var _args = args[0] = {};
            _args[TYPE] = type;
            _args[EXECUTOR] = executor;
            _args[SCOPE] = me;

            while (length > 0) {
              args[length] = arguments[--length];
            }

            // Return result of emit
            return me.emit.apply(me, args);
          });
        }
      },

      /**
       * @handler
       * @localdoc Adds handler to `handlers[DELEGATED]` or `handlers[DIRECT]` depending on `handler[DATA]`.
       * @inheritdoc #event-sig/added
       */
      "sig/added": function (handlers, handler) {
        var data;

        // Check that this is a DOM handler
        if (RE.test(handler[TYPE])) {
          data = handler[DATA];

          if (data !== UNDEFINED) {
            handlers[DELEGATED].add(data[0], handler);
          }
          else {
            handlers[DIRECT].push(handler);
          }
        }
      },

      /**
       * @handler
       * @localdoc Removes the DOM event proxies that are registered on {@link #$element}.
       * @inheritdoc
       */
      "sig/teardown": function (handlers, type) {
        var me = this;
        var matches;

        // Check that this is a DOM handler
        if ((matches = RE.exec(type)) !== NULL) {
          // $element.off handlers[PROXY]
          me[$ELEMENT].off(matches[1], NULL, handlers[PROXY]);
        }
      },

      /**
       * @handler
       * @localdoc Removes handle from `handlers[DELEGATED]` or `handlers[DIRECT]` depending on `handler[DATA]`.
       * @inheritdoc #event-sig/removed
       */
      "sig/removed": function (handlers, handler) {
        var data;

        // Check that this is a DOM handler
        if (RE.test(handler[TYPE])) {
          data = handler[DATA];

          if (data !== UNDEFINED) {
            handlers[DELEGATED].remove(data[0], handler);
          }
          else {
            handlers[DIRECT] = handlers[DIRECT].filter(function (_handler) {
              return _handler !== handler;
            });
          }
        }
      }
    },

    // Create spec for render methods targeting `me[$ELEMENT]` that can be executed without args
    [ "html", "text" ].reduce(function (spec, method) {
      // Create `spec[method]`
      spec[method] = function () {
        var me = this;
        var $element = me[$ELEMENT];
        var length = arguments[LENGTH];
        var args;
        var result;

        // If there were no arguments ...
        if (length === 0) {
          // ... call `$element[method]` without arguments ...
          result = $element[method]();
        }
        // ... otherwise ...
        else {
          // Create `args`
          args = new Array(length);

          // Let `args` be `ARRAY_SLICE.call(arguments)` without deop
          while (length-- > 0) {
            args[length] = arguments[length];
          }

          result = $render.call(me, $element, method, args);
        }

        return result;
      };

      // Return spec for next iteration
      return spec;
    }, {}),

    // Create spec for render methods targeting `me[$ELEMENT]`
    [ "before", "after", "append", "prepend" ].reduce(function (spec, method) {
      // Create `spec[method]`
      spec[method] = function () {
        var me = this;
        var length = arguments[LENGTH];
        var args = new Array(length);

        // Let `args` be `ARRAY_SLICE.call(arguments)` without deop
        while (length-- > 0) {
          args[length] = arguments[length];
        }

        return $render.call(me, me[$ELEMENT], method, args);
      };

      // Return spec for next iteration
      return spec;
    }, {}),

    // Create spec for render methods targeting provided `$element`
    [ "appendTo", "prependTo" ].reduce(function (spec, method) {
      // Create `spec[method]`
      spec[method] = function ($element) {
        var length = arguments[LENGTH];
        var args = new Array(length - 1);

        // Let `args` be `ARRAY_SLICE.call(arguments, 1)` without deop
        while (length-- > 1) {
          args[length - 1] = arguments[length];
        }

        return $render.call(this, $element, method, args);
      };

      // Return spec for next iteration
      return spec;
    }, {})
  );
});
