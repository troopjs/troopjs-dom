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
	 * This module is to provide configurations **dom** from it's AMD module config.
	 *
	 * To change the configuration, refer to RequireJS [module config API](http://requirejs.org/docs/api.html#config-moduleconfig):
	 *
	 * 	requirejs.config(
	 * 	{
	 * 		config: { "troopjs-browser/dom/config" : { "querySelectorAll" : $.find, ...  } }
	 * 	})
	 *
	 * [1]: http://requirejs.org/docs/api.html#config-moduleconfig
	 *
	 * @class browser.dom.config
	 * @protected
	 * @singleton
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
