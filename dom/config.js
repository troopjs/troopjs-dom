/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"module",
	"troopjs-utils/merge",
	"jquery"
], function (module, merge, $) {
	"use strict";

	/**
	 * Provides configuration for the dom package
	 * @class browser.dom.config
	 * @protected
	 * @alias feature.config
	 */
	return merge.call({
		/**
		 * @cfg {Function} querySelectorAll Function that provides `querySelectorAll`
		 */
		"querySelectorAll": $.find,

		/**
		 * @cfg {Function} matchesSelector Function that provides `matchesSelector`
		 */
		"matchesSelector": $.find.matchesSelector
	}, module.config());
});
