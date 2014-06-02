/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"troopjs-core/component/gadget",
	"./runner/sequence",
	"troopjs-compose/mixin/config",
	"jquery",
	"when",
	"troopjs-util/merge",
	"../loom/config",
	"../loom/weave",
	"../loom/unweave",
	"troopjs-jquery/destroy"
], function WidgetModule(Gadget, sequence, COMPOSE_CONF, $, when, merge, LOOM_CONF, loom_weave, loom_unweave) {
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
	var FINALIZE = "finalize";
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
		 * @param {Function|String|Promise} [contents] Contents to render or a Promise for contents
		 * @param {...*} [args] Template arguments
		 * @return {String|Promise} The returned content string or promise of rendering.
		 */
		function render(contents, args) {
			/*jshint validthis:true*/
			var me = this;

			// Retrieve HTML/Text.
			if (!arguments.length) {
				return $fn.call(me[$ELEMENT]);
			}

			return when
				// Wait for contents and args to resolve...
				.all(ARRAY_SLICE.call(arguments))
				.then(function (_args) {
					// First argument is the resolved value of contents
					var _contents = _args.shift();

					// If _contents is a function, apply it with _args, otherwise just pass it along to the callback
					return when(typeof _contents === TYPEOF_FUNCTION ? _contents.apply(me, _args) : contents, function (result) {
						// Call $fn in the context of me[$ELEMENT] with result as the only argument
						// Find something to weave
						// Pass it to loom_weave and return the result
						return loom_weave.call($fn.call(me[$ELEMENT], result).find(SELECTOR_WEAVE));
					});
				});
		}

		return render;
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

	// Add pragmas for DOM specials
	COMPOSE_CONF.pragmas.push({
		"pattern": /^dom(?:\:([^\/]+))?\/(.+)/,
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

		// No $element
		if ($element === UNDEFINED) {
			throw new Error("No $element provided");
		}
		// Is _not_ a jQuery element
		else if (!$element.jquery) {
			// From a plain dom node
			if ($element.nodeType) {
				$element = $($element);
			}
			else {
				throw new Error("Unsupported widget element");
			}
		}
		// From a different jQuery instance
		else if (($get = $element.get) !== $GET) {
			$element = $($get.call($element, 0));
		}

		/**
		 * jQuery element this widget is attached to
		 * @property {jQuery} $element
		 * @readonly
		 * @protected
		 */
		me[$ELEMENT] = $element;

		if (displayName !== UNDEFINED) {
			me.displayName = displayName;
		}

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
					args[RUNNER] = sequence;
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
		 * @inheritdoc dom.loom.weave#constructor
		 */
		"weave" : function weave() {
			return loom_weave.apply(this[$ELEMENT].find(SELECTOR_WEAVE), arguments);
		},

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
		 */
		"before" : $render($.fn.before),

		/**
		 * Renders content and inserts it after {@link #$element}
		 * @method
		 * @inheritdoc #html
		 */
		"after" : $render($.fn.after),

		/**
		 * Renders content and replaces {@link #$element} html contents
		 * @method
		 * @param {Function|String} contents Template/String to render
		 * @param {...*} [args] Template arguments
		 * @return {Promise} Promise of  render
		 */
		"html" : $render($.fn.html),

		/**
		 * Renders content and replaces {@link #$element} text contents
		 * @method
		 * @inheritdoc #html
		 */
		"text" : $render($.fn.text),

		/**
		 * Renders content and appends it to {@link #$element}
		 * @method
		 * @inheritdoc #html
		 */
		"append" : $render($.fn.append),

		/**
		 * Renders content and prepends it to {@link #$element}
		 * @method
		 * @inheritdoc #html
		 */
		"prepend" : $render($.fn.prepend)
	});
});
