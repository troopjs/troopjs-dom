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

	var NULL = null;
	var ARRAY_MAP = Array.prototype.map;
	var LENGTH = "length";
	var $WEFT = config["$weft"];
	var RE_ANY = /.*/;
	var RE_WIDGET = /([\w\d_\/\.\-]+)(?:@(\d+))?/;

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
		var woven_re = arguments[LENGTH] > 0
			? new RegExp(
				ARRAY_MAP
					.call(arguments, function (arg) {
						var matches;

						// matches[1] : widget name - "widget/name"
						// matches[2] : widget instance id - "123"
						return ((matches = RE_WIDGET.exec(arg)) !== NULL)
							? "^" + matches[1] + "@" + (matches[2] || "\\d+") + "$"
							: NULL;
					})
					.filter(function (arg) {
						return arg !== NULL
					})
					.join("|")
			)
			: RE_ANY;

		return when.all(ARRAY_MAP.call(this, function (element) {
			return when.filter($.data(element, $WEFT) || false, function (widget) {
				return woven_re.test(widget);
			});
		}));
	};
});
