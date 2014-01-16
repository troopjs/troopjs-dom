/**
 * TroopJS browser/loom/weave
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "./config", "require", "when", "jquery", "troopjs-utils/getargs", "./unweave", "troopjs-utils/defer", "poly/array" ], function WeaveModule(config, parentRequire, when, $, getargs, unweave, Defer) {
	"use strict";

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_MAP = ARRAY_PROTO.map;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SHIFT = ARRAY_PROTO.shift;
	var WEAVE = "weave";
	var WOVEN = "woven";
	var LENGTH = "length";
	var $WARP = config["$warp"];
	var $WEFT = config["$weft"];
	var ATTR_WEAVE = config[WEAVE];
	var ATTR_WOVEN = config[WOVEN];
	var RE_SEPARATOR = /[\s,]+/;

	// collect the list of fulfilled promise values from a list of descriptors.
	function fulfilled(descriptors) {
		return descriptors.filter(function(d) {
			return d.state === "fulfilled";
		}).map(function(d) {
			return d.value;
		});
	}

	/**
	 * Weaves elements
	 * @returns {Promise} of weaving
	 */
	return function weave() {
		// Store start_args for later
		var start_args = arguments;

		// Map elements
		return when.all(ARRAY_MAP.call(this, function (element) {
			var $element = $(element);
			var $data = $element.data();

			// First time weaving.
			if(!$data[$WARP]){
				$element.one("destroy", function() { unweave.call($element); });
				$data[$WARP] = [];
			}

			var $warp = $data[$WARP];
			var to_weave = [];
			var weave_attr = $element.attr(ATTR_WEAVE) || "";
			var weave_args;
			var re = /[\s,]*(((?:\w+!)?([\w\d_\-\/\.]+)(?:#[^(\s]+)?)(?:\(([^\)]+)\))?)/g;
			var matches;

			/**
			 * Updated attributes
			 * @param {object} widget Widget
			 * @private
			 */
			var update_attr = function (widgets) {
				var woven = [];
				var weaved = [];

				widgets.forEach(function (widget) {
					weaved.push(widget[$WEFT][WEAVE]);
					woven.push(widget[$WEFT][WOVEN]);
				});

				$element
					// Add those widgets to data-woven.
					.attr(ATTR_WOVEN, function (index, attr) {
						attr = (attr !== UNDEFINED ? attr.split(RE_SEPARATOR) : []).concat(woven).join(" ");
						return attr || null;
					})
					// Remove only those actually woven widgets from "data-weave".
					.attr(ATTR_WEAVE, function(index, attr) {
						var result = [];
						if (attr !== UNDEFINED) {
							result = to_weave.filter(function(args) {
								return weaved.indexOf(args[WEAVE]) < 0;
							}).map(function(args) { return args[WEAVE]; });
						}
						return result[LENGTH] === 0 ? null : result.join(" ");
					});
			};

			var args;

			// Iterate weave_attr (while re matches)
			// matches[1] : full widget module name (could be loaded from plugin) - "mv!widget/name#1.x(1, 'string', false)"
			// matches[2] : widget name and arguments - "widget/name(1, 'string', false)"
			// matches[3] : widget name - "widget/name"
			// matches[4] : widget arguments - "1, 'string', false"
			while ((matches = re.exec(weave_attr)) !== NULL) {
				/*jshint loopfunc:true*/
				// Create weave_args
				// Require module, add error handler
				// Arguments to pass to the widget constructor.
				args = matches[4];

				// module name, DOM element, widget display name.
				weave_args = [ matches[2], $element.get(0), matches[3] ];

				// Store matches[1] as WEAVE on weave_args
				weave_args[WEAVE] = matches[1];

				// If there were additional arguments
				if (args !== UNDEFINED) {
					// Parse matches[2] using getargs, map the values and append to weave_args
					ARRAY_PUSH.apply(weave_args, getargs.call(args).map(function (value) {
						// If value from $data if key exist
						return value in $data
							? $data[value]
							: value;
					}));
				}

				// Push on $weave
				ARRAY_PUSH.call(to_weave, weave_args);
			}

			// process with all successful weaving.
			return when.settle(to_weave.map(function (widget_args) {
				// Create deferred
				var deferred = when.defer();
				var resolver = deferred.resolver;
				var promise = deferred.promise;
				var module = ARRAY_SHIFT.call(widget_args);

				// Copy WEAVE
				promise[WEAVE] = widget_args[WEAVE];

				// Add promise to $warp
				ARRAY_PUSH.call($warp, promise);

				setTimeout(function() {
					parentRequire([ module ], function(Widget) {
						var widget;
						var startPromise;

						// detect if weaving has been canceled somehow.
						if ($warp.indexOf(promise) === -1) {
							resolver.reject("cancel");
							return;
						}

						try {
							// Create widget instance
							widget = Widget.apply(Widget, widget_args);

							// Add $WEFT to widget
							widget[$WEFT] = promise;

							// Add WOVEN to promise
							promise[WOVEN] = widget.toString();

							// Feature detecting 1.x widget.
							if(widget.trigger){
								deferred = Defer();
								widget.start(deferred);
								startPromise = deferred.promise;
							}
							else
								startPromise = widget.start.apply(widget, start_args);

							resolver.resolve(startPromise.yield(widget));
						}
						catch (e) {
							resolver.reject(e);
						}
					}, resolver.reject);
				});

				// Return promise
				return promise;
			}))
			.then(fulfilled)
			// Updating the element attributes with started widgets.
			.tap(update_attr);
		}));
	};
});
