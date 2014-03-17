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
	 * @extends requirejs.config
	 * @inheritdoc
	 * @localdoc This module is to provide configurations **dom** from it's AMD module config.
	 * @protected
	 * @static
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
