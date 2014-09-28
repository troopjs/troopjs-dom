/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"jquery",
	"when",
	"./config",
	"./weave",
	"./unweave",
	"./woven",
	"poly/array"
], function WeaveModule($, when, config, weave, unweave, woven) {
	"use strict";

	/**
	 * Extends {@link jQuery} with:
	 *
	 *  - {@link $#property-woven} property
	 *  - {@link $#method-weave}, {@link $#method-unweave} and {@link $#method-woven} methods
	 *
	 * @class dom.loom.plugin
	 * @static
	 * @alias plugin.jquery
	 */

	var UNDEFINED;
	var $FN = $.fn;
	var $EXPR = $.expr;
	var WEAVE = "weave";
	var UNWEAVE = "unweave";
	var WOVEN = "woven";
	var ATTR_WOVEN = config[WOVEN];

	/**
	 * Tests if element has a data-woven attribute
	 * @param element to test
	 * @return {boolean}
	 * @ignore
	 */
	function hasDataWovenAttr(element) {
		return $(element).attr(ATTR_WOVEN) !== UNDEFINED;
	}

	/**
	 * @class $
	 */

	/**
	 * jQuery `:woven` expression
	 * @property woven
	 */
	$EXPR[":"][WOVEN] = $EXPR.createPseudo(function (widgets) {
		// If we don't have widgets to test, quick return optimized expression
		if (widgets === UNDEFINED) {
			return hasDataWovenAttr;
		}

		// Scope `woven_re` locally since we use the `g` flag
		var woven_re = /[\s,]*([\w\d_\/\.\-]+)(?:@(\d+))?/g;
		var woven_res = [];
		var woven_res_length = 0;
		var matches;

		// Iterate `widgets` (while woven_re matches)
		// matches[1] : widget name - "widget/name"
		// matches[2] : widget instance id - "123"
		while ((matches = woven_re.exec(widgets)) !== null) {
			woven_res[woven_res_length++] = "(?:^|[\\s,]+)" + matches[1] + "@" + (matches[2] || "\\d+") + "($|[\\s,]+)";
		}

		// Redefine `woven_re` as a combined regexp
		woven_re = new RegExp(woven_res.join("|"));

		// Return expression
		return function (element) {
			var attr_woven = $.attr(element, ATTR_WOVEN);

			// Check that attr_woven is not UNDEFINED, and that widgets test against a processed attr_woven
			return attr_woven !== UNDEFINED && woven_re.test(attr_woven);
		};
	});

	/**
	 * @method weave
	 * @inheritdoc dom.loom.weave#constructor
	 */
	$FN[WEAVE] = weave;

	/**
	 * @method unweave
	 * @inheritdoc dom.loom.unweave#constructor
	 */
	$FN[UNWEAVE] = unweave;

	/**
	 * @method woven
	 * @inheritdoc dom.loom.woven#constructor
	 */
	$FN[WOVEN] = woven;
});
