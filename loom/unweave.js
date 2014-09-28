/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"./config",
	"when",
	"jquery",
	"poly/array"
], function (config, when, $) {
	"use strict";

	/**
	 * @class dom.loom.unweave
	 * @mixin dom.loom.config
	 * @mixin Function
	 * @static
	 */
	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_MAP = ARRAY_PROTO.map;
	var LENGTH = "length";
	var $WEFT = config["$weft"];
	var ATTR_WOVEN = config["woven"];
	var ATTR_UNWEAVE = config["unweave"];
	var RE_SEPARATOR = /[\s,]+/;

	/**
	 * Destroy all widget instances living on this element, that are created
	 * by {@link dom.loom.weave}, it is also to clean up the attributes
	 * and data references to the previously instantiated widgets.
	 *
	 * @localdoc
	 *
	 * It also lives as a jquery plugin as {@link $#method-unweave}.
	 *
	 * @method constructor
	 * @param {...*} [stop_args] Arguments that will be passed to each widget's {@link dom.component.widget#stop stop} method
	 * @return {Promise} Promise to the completion of unweaving all woven widgets.
	 */
	return function unweave() {
		/**
		 * Unweaves `$element`
		 * @param {jQuery} $element
		 * @param {String} unweave_attr
		 * @return {Promise}
		 * @private
		 */
		var $unweave = function (unweave_attr) {
			// Let `$element` be `this`
			var $element = this;
			// Get all data from `$element`
			var $data = $element.data();
			// Let `$weft` be `$data[$WEFT]` or `$data[$WEFT] = []`
			var $weft = $data.hasOwnProperty($WEFT)
				? $data[$WEFT]
				: $data[$WEFT] = [];
			// Scope `unweave_re` locally since we use the `g` flag
			var unweave_re = /[\s,]*([\w\d_\/\.\-]+)(?:@(\d+))?/g;
			var unweave_res = [];
			var unweave_res_length = 0;
			var matches;

			// Iterate unweave_attr (while unweave_re matches)
			// matches[1] : widget name - "widget/name"
			// matches[2] : widget instance id - "123"
			while ((matches = unweave_re.exec(unweave_attr)) !== NULL) {
				unweave_res[unweave_res_length++] = "^" + matches[1] + "@" + (matches[2] || "\\d+") + "$";
			}

			// Redefine `unweave_re` as a combined regexp
			unweave_re = new RegExp(unweave_res.join("|"));

			// Start async promise chain
			return when
				// Filter $weft
				.filter($weft, function (widget, index) {
					// Bail fast if we don't want to unweave
					if (!unweave_re.test(widget.toString())) {
						return false;
					}

					// Let `deferred` be `when.defer()`
					var deferred = when.defer();
					// Extract `resolve`, `reject` from `deferred`
					var resolve = deferred.resolve;
					var reject = deferred.reject;
					// Let `$weft[index]` be `deferred.promise`
					// Let `promise` be `$weft[index]`
					var promise = $weft[index] = deferred.promise;
					var $deferred;

					// TroopJS <= 1.x
					if (widget.trigger) {
						// Let `$deferred` be `$.Deferred()`
						$deferred = $.Deferred();

						// Get trusted promise
						when($deferred).then(resolve, reject);

						// Stop widget
						widget.stop.call(widget, $deferred);
					}
					// TroopJS >= 2.x
					else {
						// Stop widget
						widget.stop.apply(widget, stop_args).then(resolve, reject);
					}

					return promise
						// Make sure to remove the promise from `$weft`
						.tap(function () {
							delete $weft[index];
						})
						.yield(true);
			})
			.tap(function (widgets) {
					// Bail fast if no widgets were unwoven
					if (widgets[LENGTH] === 0) {
						return;
					}

					// Let `unwoven` be a combined regexp of unwoven `widget.toString()`
					var unwoven = new RegExp(
						widgets
							.map(function (widget) {
								return "^" + widget.toString() + "$";
							})
							.join("|")
					);

					/**
					 * Filters values using `unwoven`
					 * @param {String} value
					 * @return {boolean}
					 * @ignore
					 */
					var filter = function (value) {
						return !unwoven.test(value);
					};

					// Update `$element` attribute `ATTR_WOVEN`
					$element.attr(ATTR_WOVEN, function (index, attr) {
						// Split `attr` and filter with `filter`
						var values = (attr === UNDEFINED ? ARRAY_PROTO : attr.split(RE_SEPARATOR)).filter(filter);
						// If `values[LENGTH]` is not `0` ...
						return values[LENGTH] !== 0
							// ... return `values.join(" ")`
							? values.join(" ")
							// ... otherwise return `NULL` to remove the attribute
							: NULL;
					});
			});
		};

		// Let `stop_args` be `arguments`
		var stop_args = arguments;

		// Wait for map (sync) and weave (async)
		return when.all(ARRAY_MAP.call(this, function (element) {
			// Bless `$element` with `$`
			var $element = $(element);
			// Get ATTR_WEAVE attribute or default to `""`
			var unweave_attr = $element.attr(ATTR_UNWEAVE) || "";
			// Make sure to remove ATTR_UNWEAVE asap in case someone else tries to `unweave` again
			$element.removeAttr(ATTR_UNWEAVE);
			// Attempt weave
			return $unweave.call($element, unweave_attr);
		}));
	};
});
