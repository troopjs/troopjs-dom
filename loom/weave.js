/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"./config",
	"require",
	"when",
	"jquery",
	"troopjs-util/getargs",
	"poly/array"
], function (config, parentRequire, when, $, getargs) {
	"use strict";

	/**
	 * @class dom.loom.weave
	 * @mixin dom.loom.config
	 * @mixin Function
	 * @static
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_MAP = ARRAY_PROTO.map;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var DEFERRED = "deferred";
	var MODULE = "module";
	var LENGTH = "length";
	var $WEFT = config["$weft"];
	var ATTR_WEAVE = config["weave"];
	var ATTR_WOVEN = config["woven"];
	var RE_SEPARATOR = /[\s,]+/;

	/**
	 * Instantiate all {@link dom.component.widget widgets}  specified in the {@link dom.loom.config#weave weave attribute}
	 * of this element, and to signal the widget for start with the arguments.
	 *
	 * The weaving will result in:
	 *
	 *  - Updates the {@link dom.loom.config#weave woven attribute} with the created widget instances names.
	 *  - The {@link dom.loom.config#$weft $weft data property} will reference the widget instances.
	 *
	 * @localdoc
	 *
	 * It also lives as a jquery plugin as {@link $#method-weave}.
	 *
	 * **Note:** It's not commonly to use this method directly, use instead {@link $#method-weave jQuery.fn.weave}.
	 *
	 * 	// Create element for weaving
	 * 	var $el = $('<div data-weave="my/widget(option)"></div>')
	 * 	// Populate `data`
	 * 	.data("option",{"foo":"bar"})
	 * 	// Instantiate the widget defined in "my/widget" module, with one param read from the element's custom data.
	 * 	.weave();
	 *
	 * @method constructor
	 * @param {...*} [start_args] Arguments that will be passed to each widget's {@link dom.component.widget#start start} method
	 * @return {Promise} Promise for the completion of weaving all widgets.
	 */
	return function weave() {
		/**
		 * Weaves `$element`
		 * @param {String} weave_attr
		 * @return {Promise}
		 * @private
		 */
		var $weave = function (weave_attr) {
			// Let `$element` be `this`
			var $element = this;

			/**
			 * Maps `value` to `$data[value]`
			 * @param {*} value
			 * @return {*}
			 * @private
			 */
			var $map = function (value) {
				return $data.hasOwnProperty(value)
					? $data[value]
					: value;
			};

			// Get all data from `$element`
			var $data = $element.data();
			// Let `$weft` be `$data[$WEFT]` or `$data[$WEFT] = []`
			var $weft = $data.hasOwnProperty($WEFT)
				? $data[$WEFT]
				: $data[$WEFT] = [];
			var $weft_length = $weft[LENGTH];
			// Scope `weave_re` locally since we use the `g` flag
			var weave_re = /[\s,]*(((?:\w+!)?([\w\d_\/\.\-]+)(?:#[^(\s]+)?)(?:\(([^\)]+)\))?)/g;
			// Let `weave_args` be `[]`
			var weave_args = [];
			var weave_args_length = 0;
			var weave_arg;
			var args;
			var matches;

			// Iterate while `weave_re` matches
			// matches[1] : full widget module name (could be loaded from plugin) - "mv!widget/name#1.x(1, 'string', false)"
			// matches[2] : widget name and arguments - "widget/name(1, 'string', false)"
			// matches[3] : widget name - "widget/name"
			// matches[4] : widget arguments - "1, 'string', false"
			while ((matches = weave_re.exec(weave_attr)) !== NULL) {
				// Let `weave_arg` be [ $element, widget display name ].
				weave_arg = [ $element, matches[3] ];
				// Let `weave_arg[MODULE]` be `matches[3]`
				weave_arg[MODULE] = matches[3];
				// If there were additional arguments ...
				if ((args = matches[4]) !== UNDEFINED) {
					// .. parse them using `getargs`, `.map` the values with `$map` and push to `weave_arg`
					ARRAY_PUSH.apply(weave_arg, getargs.call(args).map($map));
				}

				// Let `weave_arg[DEFERRED]` be `when.defer()`
				// Let `$weft[$weft_length++]` be `weave_arg[DEFERRED].promise`
				$weft[$weft_length++] = (weave_arg[DEFERRED] = when.defer()).promise;

				// Push `weave_arg` on `weave_args`
				weave_args[weave_args_length++] = weave_arg;
			}

			// Start async promise chain
			return when
				// Require, instantiate and start
				.map(weave_args, function (widget_args) {
					// Let `deferred` be `widget_args[DEFERRED]`
					var deferred = widget_args[DEFERRED];

					// Extract `resolve`, `reject` and `promise` from `deferred`
					var resolve = deferred.resolve;
					var reject = deferred.reject;

					// Require `weave_arg[MODULE]`
					parentRequire([ widget_args[MODULE] ], function (Widget) {
						var widget;
						var $deferred;

						// Create widget instance
						widget = Widget.apply(Widget, widget_args);

						// TroopJS <= 1.x
						if (widget.trigger) {
							// Let `$deferred` be `$.Deferred()`
							$deferred = $.Deferred();

							// Get trusted promise
							when($deferred)
								// Yield
								.yield(widget)
								// Link
								.then(resolve, reject);

							// Start widget
							widget.start.call(widget, $deferred);
						}
						// TroopJS >= 2.x
						else {
							// Start widget
							widget.start.apply(widget, start_args)
								// Yield
								.yield(widget)
								// Link
								.then(resolve, reject);
						}
					}, reject);

					// Return `deferred.promise`
					return deferred.promise;
				})
				// Update `ATTR_WOVEN`
				.tap(function (widgets) {
					// Bail fast if no widgets were woven
					if (widgets[LENGTH] === 0) {
						return;
					}

					// Map `Widget[]` to `String[]`
					var woven = widgets.map(function (widget) {
						return widget.toString();
					});

					// Update `$element` attribute `ATTR_WOVEN`
					$element.attr(ATTR_WOVEN, function (index, attr) {
						// Split `attr` and concat with `woven`
						var values = (attr === UNDEFINED ? ARRAY_PROTO : attr.split(RE_SEPARATOR)).concat(woven);
						// If `values[LENGTH]` is not `0` ...
						return values[LENGTH] !== 0
							// ... return `values.join(" ")`
							? values.join(" ")
							// ... otherwise return `NULL` to remove the attribute
							: NULL;
					});
				});
		};

		// Let `start_args` be `arguments`
		var start_args = arguments;

		// Wait for map (sync) and weave (async)
		return when.all(ARRAY_MAP.call(this, function (element) {
			// Bless `$element` with `$`
			var $element = $(element);
			// Get ATTR_WEAVE attribute or default to `""`
			var weave_attr = $element.attr(ATTR_WEAVE) || "";
			// Make sure to remove ATTR_WEAVE asap in case someone else tries to `weave` again
			$element.removeAttr(ATTR_WEAVE);
			// Attempt weave
			return $weave.call($element, weave_attr);
		}));
	}
});
