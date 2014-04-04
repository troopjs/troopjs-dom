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
	 * @class browser.dom.config
	 * @mixin requirejs.config
	 * @inheritdoc requirejs.config
	 * @localdoc This module is to provide configurations **dom** from it's AMD module config.
	 * @protected
	 * @static
	 * @alias config.browser.dom.config
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
