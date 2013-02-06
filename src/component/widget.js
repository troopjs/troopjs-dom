/**
 * TroopJS browser/component/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "troopjs-core/component/gadget", "jquery", "troopjs-jquery/weave", "troopjs-jquery/action" ], function WidgetModule(Gadget, $) {
	var FUNCTION = Function;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SHIFT = ARRAY_PROTO.shift;
	var ARRAY_UNSHIFT = ARRAY_PROTO.unshift;
	var $TRIGGER = $.fn.trigger;
	var $ON = $.fn.on;
	var $OFF = $.fn.off;
	var $ELEMENT = "$element";
	var $HANDLERS = "$handlers";
	var ATTR_WEAVE = "[data-weave]";
	var ATTR_WOVEN = "[data-woven]";
	var LENGTH = "length";
	var FEATURES = "features";
	var TYPE = "type";
	var VALUE = "value";

	/**
	 * Creates a proxy of the inner method 'handlerProxy' with the 'topic', 'widget' and handler parameters set
	 * @param {string} topic event topic
	 * @param {object} widget target widget
	 * @param {function} handler target handler
	 * @returns {function} proxied handler
	 */
	function eventProxy(topic, widget, handler) {
		/**
		 * Creates a proxy of the outer method 'handler' that first adds 'topic' to the arguments passed
		 * @returns result of proxied hanlder invocation
		 */
		return function handlerProxy() {
			// Add topic to front of arguments
			ARRAY_UNSHIFT.call(arguments, topic);

			// Apply with shifted arguments to handler
			return handler.apply(widget, arguments);
		};
	}

	/**
	 * Creates a proxy of the inner method 'render' with the '$fn' parameter set
	 * @param $fn jQuery method
	 * @returns {Function} proxied render
	 */
	function renderProxy($fn) {
		/**
		 * Renders contents into element
		 * @param {function|string} contents Template/String to render
		 * @param {object} data If contents is a template - template data (optional)
		 * @returns {object} self
		 */
		function render(/* contents, data, ... */) {
			var self = this;
			var arg = arguments;

			// Shift contents from first argument
			var contents = ARRAY_SHIFT.call(arg);

			// Call render with contents (or result of contents if it's a function)
			$fn.call(self[$ELEMENT], contents instanceof FUNCTION ? contents.apply(self, arg) : contents);

			return self.weave();
		}

		return render;
	}

	return Gadget.extend(function Widget($element, displayName) {
		var self = this;

		self[$ELEMENT] = $element;
		self[$HANDLERS] = [];

		if (displayName) {
			self.displayName = displayName;
		}
	}, {
		"displayName" : "browser/component/widget",

		/**
		 * Signal handler for 'initialize'
		 */
		"sig/initialize" : function initialize() {
			var self = this;
			var $element = self[$ELEMENT];
			var $handler;
			var $handlers = self[$HANDLERS];
			var handler;
			var handlers = self.constructor.specials.dom;
			var type;
			var features;
			var value;
			var i;
			var iMax;

			// Iterate handlers
			for (i = 0, iMax = handlers ? handlers[LENGTH] : 0; i < iMax; i++) {
				// Get handler
				handler = handlers[i];

				// Create $handler
				$handler = $handlers[i] = {};

				// Set $handler properties
				$handler[TYPE] = type = handler[TYPE];
				$handler[FEATURES] = features = handler[FEATURES];
				$handler[VALUE] = value = eventProxy(type, self, handler[VALUE]);

				// Attach event handler
				$ON.call($element, type, features, self, value);
			}
		},

		/**
		 * Signal handler for 'finalize'
		 */
		"sig/finalize" : function finalize() {
			var self = this;
			var $element = self[$ELEMENT];
			var $handler;
			var $handlers = self[$HANDLERS];
			var i;
			var iMax;

			// Iterate $handlers
			for (i = 0, iMax = $handlers[LENGTH]; i < iMax; i++) {
				// Get $handler
				$handler = $handlers[i];

				// Detach event handler
				$OFF.call($element, $handler[TYPE], $handler[FEATURES], $handler[VALUE]);
			}

			// Delete ref to $ELEMENT (for safety)
			delete self[$ELEMENT];
		},

		/**
		 * Weaves all children of $element
		 * @returns self
		 */
		"weave" : function weave() {
			return this[$ELEMENT].find(ATTR_WEAVE).weave();
		},

		/**
		 * Unweaves all children of $element _and_ self
		 * @returns self
		 */
		"unweave" : function unweave() {
			return this[$ELEMENT].find(ATTR_WOVEN).addBack().unweave();
		},

		/**
		 * Binds event to $element
		 * @returns self
		 */
		"$on" : function $on() {
			var self = this;

			$ON.apply(self[$ELEMENT], arguments);

			return self;
		},

		/**
		 * Unbinds event from $element
		 * @returns self
		 */
		"$off" : function $off() {
			var self = this;

			$OFF.apply(self[$ELEMENT], arguments);

			return self;
		},

		/**
		 * Triggers event on $element
		 * @returns self
		 */
		"$emit" : function $emit() {
			var self = this;

			$TRIGGER.apply(self[$ELEMENT], arguments);

			return self;
		},

		/**
		 * Renders content and inserts it before $element
		 */
		"before" : renderProxy($.fn.before),

		/**
		 * Renders content and inserts it after $element
		 */
		"after" : renderProxy($.fn.after),

		/**
		 * Renders content and replaces $element contents
		 */
		"html" : renderProxy($.fn.html),

		/**
		 * Renders content and replaces $element contents
		 */
		"text" : renderProxy($.fn.text),

		/**
		 * Renders content and appends it to $element
		 */
		"append" : renderProxy($.fn.append),

		/**
		 * Renders content and prepends it to $element
		 */
		"prepend" : renderProxy($.fn.prepend)
	});
});
