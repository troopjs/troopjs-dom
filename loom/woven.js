/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"./config",
	"when",
	"jquery",
	"poly/array"
], function WovenModule(config, when, $) {
	"use strict";

	/**
	 * @class dom.loom.woven
	 * @mixin dom.loom.config
	 * @mixin Function
	 * @static
	 */

	var ARRAY_MAP = Array.prototype.map;
	var LENGTH = "length";
	var WOVEN = "woven";
	var $WARP = config["$warp"];

	/**
	 * Retrieve all or specific widget instances living on this element, that are
	 * created by {@link dom.loom.weave}.
	 *
	 * It also lives as a jquery plugin as {@link $#method-woven}.
	 * @method constructor
	 * @param {...String} [widget] One or more widget names to narrow down the returned ones.
	 * @return {Promise} Promise to the completion of retrieving the woven widgets array.
	 */
	return function woven() {
		var $woven = [];
		var $wovenLength = 0;
		var re;

		// If we have arguments we have convert and filter
		if (arguments[LENGTH] > 0) {
			// Map arguments to a regexp
			re = new RegExp(ARRAY_MAP.call(arguments, function (widget) {
				return "^" + widget;
			}).join("|"), "m");

			// Iterate
			$(this).each(function (index, element) {
				// Filter widget promises
				var $widgets = ($.data(element, $WARP) || []).filter(function ($weft) {
					return re.test($weft[WOVEN]);
				});

				// Add promise of widgets to $woven
				$woven[$wovenLength++] = when.all($widgets);
			});
		}
		// Otherwise we can use a faster approach
		else {
			// Iterate
			$(this).each(function (index, element) {
				// Add promise of widgets to $woven
				$woven[$wovenLength++] = when.all($.data(element, $WARP));
			});
		}

		// Return promise of $woven
		return when.all($woven);
	};
});
