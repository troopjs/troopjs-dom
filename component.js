/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"troopjs-core/component/gadget",
	"./config",
	"./runner/sequence",
	"troopjs-compose/decorator/before",
	"jquery",
	"when",
	"when/function",
	"mu-selector-set",
	"poly/array",
	"mu-jquery-destroy"
], function (Gadget, config, sequence, before, $, when, fn, SelectorSet) {
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
	var $FN = $.fn;
	var $GET = $FN.get;
	var APPLY = fn.apply;
	var TOSTRING_FUNCTION = "[object Function]";
	var $ELEMENT = "$element";
	var PROXY = "proxy";
	var DOM = "dom";
	var ARGS = "args";
	var NAME = "name";
	var VALUE = "value";
	var TYPE = "type";
	var RUNNER = "runner";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var DATA = "data";
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

	/**
	 * Render signal
	 * @event sig/render
	 * @localdoc Triggered after {@link #before}, {@link #after}, {@link #html}, {@link #text}, {@link #append} and {@link #prepend}
	 * @since 3.0
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
	 * Renders content and prepends it to {@link #$element}
	 * @method prepend
	 * @inheritdoc #html
	 * @fires sig/render
	 */

	// Add pragmas for DOM specials
	config.pragmas.push({
		"pattern": /^dom(?::([^\/]+))?\/([^\(]+(?=$))/,
		"replace": function(match, $1, $2) {
			return DOM + "/" + $2 + ($1 === UNDEFINED ? "()" : "(\"" + $1 + "\")");
		}
	});

	/**
	 * Creates a new component that attaches to a specified (jQuery) DOM element.
	 * @method constructor
	 * @param {jQuery|HTMLElement} $element The element that this component should be attached to
	 * @param {String} [displayName] A friendly name for this component
	 * @throws {Error} If no $element is provided
	 * @throws {Error} If $element is not of supported type
	 */
	return Gadget.extend(function ($element, displayName) {
		var me = this;
		var $get;
		var args;

		// No $element
		if ($element === UNDEFINED || $element === NULL) {
			throw new Error("No $element provided");
		}
		// Is _not_ a jQuery element
		else if (!$element.jquery) {
			// Let `args` be `ARRAY_SLICE.call(arguments)`
			args = ARRAY_SLICE.call(arguments);

			// Let `$element` be `$($element)`
			// Let `args[0]` be `$element`
			args[0] = $element = $($element);
		}
		// From a different jQuery instance
		else if (($get = $element.get) !== $GET) {
			// Let `args` be `ARRAY_SLICE.call(arguments)`
			args = ARRAY_SLICE.call(arguments);

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
	}, {
		"displayName" : "dom/component",

		/**
		 * @handler
		 * @localdoc Registers event handlers that are declared as DOM specials.
		 * @inheritdoc
		 */
		"sig/initialize" : function () {
			var me = this;

			return when.map(me.constructor.specials[DOM] || ARRAY_PROTO, function (special) {
				return me.on(special[NAME], special[VALUE], special[ARGS][0]);
			});
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
					var args = {};
					args[TYPE] = type;
					args[RUNNER] = sequence;
					args[CONTEXT] = me;
					args = [ args ];

					// Push original arguments on args
					ARRAY_PUSH.apply(args, arguments);

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
		 * @handler
		 * @localdoc Trigger a custom DOM event "task" whenever this widget performs a task.
		 * @inheritdoc
		 */
		"sig/task" : function (task) {
			this[$ELEMENT].trigger("task", [ task ]);
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
	}, [ "html", "text", "before", "after", "append", "prepend" ].reduce(function (spec, method) {
		// Let `$fn` be `$FN[method]`
		var $fn = $FN[method];

		// Create `spec[method]`
		spec[method] = function (contentOrPromise) {
			var me = this;

			// If `arguments.length` is `0` just return `$fn.call(...)`
			if (arguments.length === 0) {
				return $fn.call(me[$ELEMENT]);
			}

			// Slice `arguments` to `args`
			var args = ARRAY_SLICE.call(arguments, 1);

			return when(contentOrPromise, function (content) {
				// If `content` is a function ...
				return (OBJECT_TOSTRING.call(content) === TOSTRING_FUNCTION)
					// ... return promise of apply ...
					? APPLY.call(me, content, args)
					// ... otherwise return `content`
					: content;
			})
				.tap(function (content) {
					var _args;

					// Let `args[0]` be `content`
					// Call `$fn` with `content`
					$fn.call(me[$ELEMENT], content);

					// Let `_args` be `[ SIG_RENDER, content ]`
					// Push `args` on `_args`
					ARRAY_PUSH.apply(_args = [ SIG_RENDER, content ], args);

					// Signal render
					return me.emit.apply(me, _args);
				});
		};

		// Return spec for next iteration
		return spec;
	}, {}));
});
