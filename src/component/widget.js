/*!
 * TroopJS widget component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "troopjs-core/component/gadget", "jquery", "troopjs-jquery/weave", "troopjs-jquery/action" ], function WidgetModule(Gadget, $) {
	var UNDEFINED;
	var NULL = null;
	var FUNCTION = Function;
	var ARRAY_PROTO = Array.prototype;
	var SHIFT = ARRAY_PROTO.shift;
	var UNSHIFT = ARRAY_PROTO.unshift;
	var $TRIGGER = $.fn.trigger;
	var $ONE = $.fn.one;
	var $BIND = $.fn.bind;
	var $UNBIND = $.fn.unbind;
	var RE = /^dom(?::(\w+))?\/([^\.]+(?:\.(.+))?)/;
	var $ELEMENT = "$element";
	var $PROXIES = "$proxies";
	var ONE = "one";
	var FEATURES = "features";
	var ATTR_WEAVE = "[data-weave]";
	var ATTR_WOVEN = "[data-woven]";

	/**
	 * Creates a proxy of the inner method 'handlerProxy' with the 'topic', 'widget' and handler parameters set
	 * @param topic event topic
	 * @param widget target widget
	 * @param handler target handler
	 * @returns {Function} proxied handler
	 */
	function eventProxy(topic, widget, handler) {
		/**
		 * Creates a proxy of the outer method 'handler' that first adds 'topic' to the arguments passed
		 * @returns result of proxied hanlder invocation
		 */
		return function handlerProxy() {
			// Add topic to front of arguments
			UNSHIFT.call(arguments, topic);

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
		 * @param contents (Function | String) Template/String to render
		 * @param data (Object) If contents is a template - template data (optional)
		 * @returns self
		 */
		function render(/* contents, data, ... */) {
			var self = this;
			var arg = arguments;

			// Shift contents from first argument
			var contents = SHIFT.call(arg);

			// Call render with contents (or result of contents if it's a function)
			$fn.call(self[$ELEMENT], contents instanceof FUNCTION ? contents.apply(self, arg) : contents);

			return self.weave();
		}

		return render;
	}

	return Gadget.extend(function Widget($element, displayName) {
		var self = this;

		self[$ELEMENT] = $element;

		if (displayName) {
			self.displayName = displayName;
		}
	}, {
		"displayName" : "browser/component/widget",

		"sig/initialize" : function initialize() {
			var self = this;
			var $element = self[$ELEMENT];
			var $proxies = self[$PROXIES] = [];
			var $proxy;
			var key;
			var value;
			var matches;
			var topic;

			// Loop over each property in widget
			for (key in self) {
				// Get value
				value = self[key];

				// Continue if value is not a function
				if (!(value instanceof FUNCTION)) {
					continue;
				}

				// Match signature in key
				matches = RE.exec(key);

				if (matches !== NULL) {
					// Get topic
					topic = matches[2];

					// Replace value with a scoped proxy
					value = eventProxy(topic, self, value);

					// Either ONE or BIND element
					(matches[2] === ONE ? $ONE : $BIND).call($element, topic, self, value);

					// Create and store $proxy
					$proxies[$proxies.length] = $proxy = [topic, value];

					// Store features
					$proxy[FEATURES] = matches[1];

					// NULL value
					self[key] = NULL;
				}
			}
		},

		"sig/finalize" : function finalize() {
			var self = this;
			var $element = self[$ELEMENT];
			var $proxies = self[$PROXIES];
			var $proxy;

			// Loop over subscriptions
			while (($proxy = $proxies.shift()) !== UNDEFINED) {
				$element.unbind($proxy[0], $proxy[1]);
			}

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
		 * Binds event from $element, exactly once
		 * @returns self
		 */
		"one" : function one() {
			var self = this;

			$ONE.apply(self[$ELEMENT], arguments);

			return self;
		},

		/**
		 * Binds event to $element
		 * @returns self
		 */
		"bind" : function bind() {
			var self = this;

			$BIND.apply(self[$ELEMENT], arguments);

			return self;
		},

		/**
		 * Unbinds event from $element
		 * @returns self
		 */
		"unbind" : function unbind() {
			var self = this;

			$UNBIND.apply(self[$ELEMENT], arguments);

			return self;
		},

		/**
		 * Triggers event on $element
		 * @returns self
		 */
		"trigger" : function trigger() {
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
