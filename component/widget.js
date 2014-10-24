/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"troopjs-core/component/gadget",
	"troopjs-core/component/runner/sequence",
	"./runner/sequence",
	"troopjs-compose/mixin/config",
	"jquery",
	"when",
	"mu-merge",
	"../loom/config",
	"../loom/weave",
	"../loom/unweave",
	"mu-jquery-destroy"
], function WidgetModule(Gadget, core_sequence, dom_sequence, COMPOSE_CONF, $, when, merge, LOOM_CONF, loom_weave, loom_unweave) {
	"use strict";

	/**
	 * Component that attaches to an DOM element, considerably delegates all DOM manipulations.
	 * @class dom.component.widget
	 * @extend core.component.gadget
	 * @alias widget.component
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var $GET = $.fn.get;
	var WHEN_ATTEMPT = when.attempt;
	var TYPEOF_FUNCTION = "function";
	var $ELEMENT = "$element";
	var MODIFIED = "modified";
	var PROXY = "proxy";
	var DOM = "dom";
	var ARGS = "args";
	var NAME = "name";
	var VALUE = "value";
	var TYPE = "type";
	var RUNNER = "runner";
	var CONTEXT = "context";
	var FINALIZE = "finalize";
	var SIG_RENDER = "sig/render";
	var SELECTOR_WEAVE = "[" + LOOM_CONF["weave"] + "]";
	var SELECTOR_WOVEN = "[" + LOOM_CONF["woven"] + "]";
	var RE = new RegExp("^" + DOM + "/(.+)");

	/**
	 * Creates a proxy of the inner method 'render' with the '$fn' parameter set
	 * @ignore
	 * @param {Function} $fn jQuery method
	 * @return {Function} proxied render
	 */
	function $render($fn) {
		/**
		 * @ignore
		 * @inheritdoc #html
		 */
		return function render(contentOrPromise, args) {
			var me = this;

			// If `_args.length` is `0` just return `$fn.call(...)`
			if (arguments.length === 0) {
				return $fn.call(me[$ELEMENT]);
			}

			// Convert arguments to an array
			var _args = ARRAY_SLICE.call(arguments);

			return when(contentOrPromise, function (contents) {
				var result;

				// Initialize event
				var event = {};
				event[RUNNER] = core_sequence;
				event[CONTEXT] = me;
				event[TYPE] = SIG_RENDER;

				// If `contents` is a function ...
				if (typeof contents === TYPEOF_FUNCTION) {
					// ... attempt and wait for resolution
					result = WHEN_ATTEMPT.apply(me, _args).then(function (output) {
						// Call `$fn` with `output`
						$fn.call(me[$ELEMENT], output);

						// Let `_args[0]` be `event`
						_args[0] = event;

						// Emit
						return me.emit.apply(me, _args);
					});
				}
				// ... otherwise we can emit right away
				else {
					// Call `$fn` with `contents`
					$fn.call(me[$ELEMENT], contents);

					// Let `_args[0]` be `event`
					_args[0] = event;

					// Emit
					result = me.emit.apply(me, _args);
				}

				// Return `result`
				return result;
			});
		}
	}

	/**
	 * Sets MODIFIED on handlers
	 * @ignore
	 * @param {Object} handlers
	 * @param {String} type
	 */
	function set_modified(handlers, type) {
		if (RE.test(type)) {
			// Set modified
			handlers[MODIFIED] = new Date().getTime();
		}
	}

	/**
	 * @ignore
	 * @inheritdoc #weave
	 */
	function weave() {
		return loom_weave.apply(this[$ELEMENT].find(SELECTOR_WEAVE), arguments);
	}

	// Add pragmas for DOM specials
	COMPOSE_CONF.pragmas.push({
		"pattern": /^dom(?::([^\/]+))?\/(.+)/,
		"replace": DOM + "/$2(\"$1\")"
	});

	/**
	 * Creates a new widget that attaches to a specified (jQuery) DOM element.
	 * @method constructor
	 * @param {jQuery|HTMLElement} $element The element that this widget should be attached to
	 * @param {String} [displayName] A friendly name for this widget
	 * @throws {Error} If no $element is provided
	 * @throws {Error} If $element is not of supported type
	 */
	return Gadget.extend(function Widget($element, displayName) {
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
		 * @protected
		 */
		me[$ELEMENT] = $element;

		// Update `me.displayName` if `displayName` was supplied
		if (displayName !== UNDEFINED) {
			me.displayName = displayName;
		}

		// Return potentially modified `args`
		return args;
	}, {
		"displayName" : "dom/component/widget",

		/**
		 * @handler
		 * @localdoc Registers event handlers that are declared as DOM specials.
		 * @inheritdoc
		 */
		"sig/initialize" : function onInitialize() {
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
		"sig/setup": function onSetup(handlers, type) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				// $element.on handlers[PROXY]
				me[$ELEMENT].on(matches[1], NULL, me, handlers[PROXY] = function dom_proxy($event) {
					var args = {};
					args[TYPE] = type;
					args[RUNNER] = dom_sequence;
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
		 * @localdoc Sets MODIFIED on handlers for matching types
		 * @inheritdoc
		 */
		"sig/add": set_modified,

		/**
		 * @handler
		 * @localdoc Sets MODIFIED on handlers for matching types
		 * @inheritdoc
		 */
		"sig/remove": set_modified,

		/**
		 * @handler
		 * @localdoc Remove for the DOM event handler proxies that are registered on the DOM element.
		 * @inheritdoc
		 */
		"sig/teardown": function onTeardown(handlers, type) {
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
		"sig/task" : function onTask(task) {
			this[$ELEMENT].trigger("task", [ task ]);
		},

		/**
		 * Render signal
		 * @event sig/render
		 * @localdoc Triggered after {@link #before}, {@link #after}, {@link #html}, {@link #text}, {@link #append} and {@link #prepend}
		 * @since 3.0
		 * @preventable
		 * @param {...*} [args] Render arguments
		 */

		/**
		 * Handles component render
		 * @handler
		 * @inheritdoc #event-sig/render
		 * @localdoc Calls {@link #weave} to ensure newly rendered html is woven
		 * @return {Promise}
		 */
		"sig/render": weave,

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
		 * @handler
		 * @inheritdoc #event-dom/destroy
		 * @localdoc Triggered when this widget is removed from the DOM
		 */
		"dom/destroy" : function onDestroy() {
			if (this.phase !== FINALIZE) {
				loom_unweave.call(this[$ELEMENT]);
			}
		},

		/**
		 * @method
		 * @inheritdoc dom.loom.weave#constructor
		 */
		"weave" : weave,

		/**
		 * @inheritdoc dom.loom.unweave#constructor
		 */
		"unweave" : function unweave() {
			return loom_unweave.apply(this[$ELEMENT].find(SELECTOR_WOVEN), arguments);
		},

		/**
		 * Renders content and inserts it before {@link #$element}
		 * @method
		 * @inheritdoc #html
		 * @fires sig/render
		 */
		"before" : $render($.fn.before),

		/**
		 * Renders content and inserts it after {@link #$element}
		 * @method
		 * @inheritdoc #html
		 * @fires sig/render
		 */
		"after" : $render($.fn.after),

		/**
		 * Renders content and replaces {@link #$element} html contents
		 * @method
		 * @param {Function|String|Promise} [contentOrPromise] Contents to render or a Promise for contents
		 * @param {...*} [args] Template arguments
		 * @fires sig/render
		 * @return {String|Promise} The returned content string or promise of rendering.
		 */
		"html" : $render($.fn.html),

		/**
		 * Renders content and replaces {@link #$element} text contents
		 * @method
		 * @inheritdoc #html
		 * @fires sig/render
		 */
		"text" : $render($.fn.text),

		/**
		 * Renders content and appends it to {@link #$element}
		 * @method
		 * @inheritdoc #html
		 * @fires sig/render
		 */
		"append" : $render($.fn.append),

		/**
		 * Renders content and prepends it to {@link #$element}
		 * @method
		 * @inheritdoc #html
		 * @fires sig/render
		 */
		"prepend" : $render($.fn.prepend)
	});
});
