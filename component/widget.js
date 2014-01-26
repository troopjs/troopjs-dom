/*
 * TroopJS browser/component/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"troopjs-core/component/gadget",
	"jquery",
	"../dom/selector",
	"troopjs-utils/merge",
	"troopjs-core/event/constants",
	"../loom/config",
	"../loom/weave",
	"../loom/unweave",
	"../loom/plugin",
	"troopjs-jquery/destroy"
], function WidgetModule(Gadget, $, Selector, merge, EVENT_CONST, LOOM_CONF, weave, unweave) {
	"use strict";

	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var ARRAY_PUSH = Array.prototype.push;
	var COMPONENT_PROTOTYPE = Gadget.prototype;
	var $GET = $.fn.get;
	var TYPEOF_FUNCTION = "function";
	var $ELEMENT = "$element";
	var DOM = "dom";
	var FEATURES = "features";
	var VALUE = "value";
	var NAME = "name";
	var LENGTH = "length";
	var SELECTOR = "selector";
	var $WEFT = LOOM_CONF["$weft"];
	var SELECTOR_WEAVE = "[" + LOOM_CONF["weave"] + "]";
	var SELECTOR_WOVEN = "[" + LOOM_CONF["woven"] + "]";

	var RUNNERS = EVENT_CONST["runners"];
	var CONTEXT = EVENT_CONST["context"];
	var CALLBACK = EVENT_CONST["callback"];
	var DATA = EVENT_CONST["data"];
	var MODIFIED = EVENT_CONST["modified"];

	/*
	 * Internal runner that executes candidates in sequence without overlap
	 * @private
	 * @param {Object} handlers List of handlers
	 * @param {Array} candidates Array of candidates
	 * @param {Array} args Initial arguments
	 * @returns {*} Result from last handler
	 */
	function dom(handlers, candidates, args) {
		var $event = args[0];
		var selector;
		var modified = handlers[MODIFIED];

		// Try get SELECTOR from handlers and check if MODIFIED
		if ((selector = handlers[SELECTOR]) === UNDEFINED || selector[MODIFIED] !== modified) {
			// Create and cache SELECTOR
			selector = handlers[SELECTOR] = Selector();

			// Set MODIFIED on selector
			selector[MODIFIED] = modified;

			// Iterate candidates
			candidates.forEach(function (candidate) {
				// Add candidate with selector or default selector '*'
				selector.add(candidate[DATA] || "*", candidate);
			});
		}

		return selector
			// Filter to only selectors that match target
			.matches($event.target)
			// Reduce so we can catch the end value
			.reduce(function (result, selector) {
				// Get candidate from selector
				var candidate = selector[1];

				// If immediate propagation is stopped we should just return last result
				if ($event.isImmediatePropagationStopped()) {
					return result;
				}

					// Did the previous candidate return false we should stopPropagation and preventDefault
				if (result === false) {
					$event.stopPropagation();
					$event.preventDefault();
				}

				// Run candidate, provide result to next run
				return candidate[CALLBACK].apply(candidate[CONTEXT], args);
			}, UNDEFINED);
	}

	/**
	 * Handles DOM events by emitting them
	 * @private
	 * @param $event jQuery Event
	 * @returns {*} Result from last executed handler
	 */
	function $handle($event) {
		// Get scope from $event.data
		var me = $event.data;

		// Prepare args[0]
		var args = [ "dom/" + $event.type + ":dom" ];

		// Push rest of arguments
		ARRAY_PUSH.apply(args, arguments);

		// Return result of emit
		return me.emit.apply(me, args);
	}

	/**
	 * Creates a proxy of the inner method 'render' with the '$fn' parameter set
	 * @private
	 * @param $fn jQuery method
	 * @returns {Function} proxied render
	 */
	function $render($fn) {
		/*
		 * Renders contents into element
		 * @private
		 * @param {Function|String} contents Template/String to render
		 * @param {...*} [args] Template arguments
		 * @returns {Promise} Promise of  render
		 */
		function render(contents, args) {
			/*jshint validthis:true*/
			var me = this;

			// Call render with contents (or result of contents if it's a function)
			return weave.call($fn.call(me[$ELEMENT],
				typeof contents === TYPEOF_FUNCTION ? contents.apply(me, ARRAY_SLICE.call(arguments, 1)) : contents
			).find(SELECTOR_WEAVE));
		}

		return render;
	}

	/**
	 * Base DOM component attached to an element, that takes care of widget instantiation.
	 * @class browser.component.widget
	 */
	return Gadget.extend(function ($element, displayName) {
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

		me[$ELEMENT] = $element;

		if (displayName !== UNDEFINED) {
			me.displayName = displayName;
		}

	}, {
		"displayName" : "browser/component/widget",

		"sig/initialize" : function onInitialize() {
			var me = this;
			var $element = me[$ELEMENT];
			var special;
			var specials;
			var i;
			var iMax;

			// Make sure we have DOM specials
			if ((specials = me.constructor.specials[DOM]) !== UNDEFINED) {
				// Iterate specials
				for (i = 0, iMax = specials[LENGTH]; i < iMax; i++) {
					special = specials[i];

					// Add special to emitter
					me.on(special[NAME], special[VALUE], special[FEATURES]);
				}

				// Bind $handle to $element
				$element.on(specials.keys.join(" "), null, me, $handle);
			}
		},

		"sig/finalize" : function onFinalize() {
			var me = this;
			var $element = me[$ELEMENT];
			var special;
			var specials;
			var i;
			var iMax;

			// Make sure we have DOM specials
			if ((specials = me.constructor.specials[DOM]) !== UNDEFINED) {
				// Iterate specials
				for (i = 0, iMax = specials[LENGTH]; i < iMax; i++) {
					special = specials[i];

					// Add special to emitter
					me.off(special[NAME], special[VALUE]);
				}

				// Unbind $handle from $element
				$element.off(specials.keys.join(" "), null, $handle);
			}
		},

		"sig/task" : function onTask(task) {
			this[$ELEMENT].trigger("task", [ task ]);
		},

		/**
		 * Weaves all children of $element
		 * @returns {Promise} from weave
		 */
		"weave" : function () {
			return weave.apply(this[$ELEMENT].find(SELECTOR_WEAVE), arguments);
		},

		/**
		 * Unweaves all woven children widgets including the widget itself.
		 * @returns {Promise} Promise of completeness of unweaving all widgets.
		 */
		"unweave" : function () {
			var woven = this[$ELEMENT].find(SELECTOR_WOVEN);

			// Unweave myself only if I am woven.
			if(this[$WEFT]) {
				woven = woven.addBack();
			}

			return unweave.apply(woven, arguments);
		},

		/**
		 * Destroy DOM handler
		 */
		"dom/destroy" : function () {
			this.unweave();
		},

		/**
		 * Renders content and inserts it before $element
		 * @method
		 */
		"before" : $render($.fn.before),

		/**
		 * Renders content and inserts it after $element
		 * @method
		 */
		"after" : $render($.fn.after),

		/**
		 * Renders content and replaces $element contents
		 * @method
		 */
		"html" : $render($.fn.html),

		/**
		 * Renders content and replaces $element contents
		 * @method
		 */
		"text" : $render($.fn.text),

		/**
		 * Renders content and appends it to $element
		 * @method
		 */
		"append" : $render($.fn.append),

		/**
		 * Renders content and prepends it to $element
		 * @method
		 */
		"prepend" : $render($.fn.prepend)
	}, (function (runners) {
		var result = {};

		result[RUNNERS] = merge.call({}, runners, {
			"dom" : dom
		});

		return result;
	})(COMPONENT_PROTOTYPE[RUNNERS]));
});
