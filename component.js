/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"troopjs-core/component/gadget",
	"./config",
	"./executor",
	"troopjs-compose/decorator/before",
	"jquery",
	"when/when",
	"mu-selector-set/main",
	"poly/array",
	"mu-jquery-destroy/main"
], function (Gadget, config, executor, before, $, when, SelectorSet) {
	"use strict";

	/**
	 * Component that manages all DOM manipulation and integration.
	 * @class dom.component
	 * @extend core.component.gadget
	 * @mixin dom.config
	 * @alias feature.component
	 */

	var UNDEFINED;
	var NULL = null;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
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
	var CALLBACK = config.emitter.callback;
	var DATA = config.emitter.data;
	var DIRECT = "direct";
	var DELEGATED = "delegated";
	var ON = "on";
	var OFF = "off";
	var SIG_RENDER = config.signal.render;
	var RE = new RegExp("^" + DOM + "/(.+)");

	function on_delegated(handler, handlers) {
		handlers[DELEGATED].add(handler[DATA], handler);
	}

	function on_direct(handler, handlers) {
		handlers[DIRECT].push(handler);
	}

	function off_delegated(handler, handlers) {
		handlers[DELEGATED].remove(handler[DATA], handler);
	}

	function off_direct(handler, handlers) {
		var direct = handlers[DIRECT];
		var index = direct.indexOf(handler);

		if (index !== -1) {
			direct.splice(index, 1);
		}
	}

	function $render($element, method, args) {
		var me = this;

		return when(args[0], function (content) {
			// If `content` is a function ...
			return (OBJECT_TOSTRING.call(content) === TOSTRING_FUNCTION)
				// ... return result of applying `content` with sliced `args`...
				? content.apply(me, ARRAY_SLICE.call(args, 1))
				// ... otherwise return `content`
				: content;
		})
			.then(function (content) {
				// Let `args[0]` be `$(content)`
				// Let `$content` be `args[0]`
				var $content = args[0] = $(content);

				// Determine direction of manipulation\
				switch(method) {
					case "appendTo":
					case "prependTo":
						$content[method]($element);
						break;

					default:
						$element[method]($content);
				}

				// Let `emit_args` be `[ SIG_RENDER ]`
				var emit_args = [ SIG_RENDER ];

				// Push `args` on `emit_args`
				ARRAY_PUSH.apply(emit_args, args);

				// Emit `emit_args`
				// Yield `args`
				return me.emit
					.apply(me, emit_args)
					.yield(args);
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
	 * @throws {Error} If no $element is provided
	 * @throws {Error} If $element is not of supported type
	 */
	return Gadget.extend(
		function ($element, displayName) {
			var me = this;
			var length = arguments[LENGTH];
			var args = new Array(length);
			var $get;

			// No $element
			if ($element === UNDEFINED || $element === NULL) {
				throw new Error("No $element provided");
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
			"displayName" : "dom/component",

			/**
			 * @handler
			 * @localdoc Registers event handlers that are declared as DOM specials.
			 * @inheritdoc
			 */
			"sig/initialize" : function () {
				var me = this;
				var specials = me.constructor.specials;

				if (specials.hasOwnProperty(DOM)) {
					specials.forEach(function (special) {
						me.on(special[NAME], special[VALUE], special[ARGS][0]);
					});
				}
			},

			/**
			 * @handler
			 * @localdoc Registers for each type of DOM event a proxy function on the DOM element that
			 * re-dispatches those events.
			 * @inheritdoc
			 */
			"sig/setup": function (handlers, type) {
				var me = this;
				var matches;

				if ((matches = RE.exec(type)) !== NULL) {
					// Create delegated and direct event stores
					handlers[DIRECT] = [];
					handlers[DELEGATED] = new SelectorSet();

					// $element.on handlers[PROXY]
					me[$ELEMENT].on(matches[1], NULL, me, handlers[PROXY] = function ($event) {
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
			 * @localdoc Remove for the DOM event handler proxies that are registered on the DOM element.
			 * @inheritdoc
			 */
			"sig/teardown": function (handlers, type) {
				var me = this;
				var matches;

				if ((matches = RE.exec(type)) !== NULL) {
					// $element.off handlers[PROXY]
					me[$ELEMENT].off(matches[1], NULL, handlers[PROXY]);
				}
			},

			/**
			 * @method
			 * @localdoc Registers emitter `on` and `off` callbacks
			 * @inheritdoc
			 */
			"on": before(function (type, callback, data) {
				var _callback = callback;

				// Check if this is a DOM type
				if (RE.test(type)) {
					// If `callback` is a function ...
					if (OBJECT_TOSTRING.call(callback) === TOSTRING_FUNCTION) {
						// Create `_callback` object
						_callback = {};
						_callback[CALLBACK] = callback;
					}

					// Set `ON` and `OFF` callbacks
					_callback[ON] = data !== UNDEFINED
						? on_delegated
						: on_direct;
					_callback[OFF] = data !== UNDEFINED
						? off_delegated
						: off_direct;
				}

				// Mutate return args to next method
				return [ type, _callback, data ];
			})
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
