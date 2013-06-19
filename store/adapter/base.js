/**
 * TroopJS browser/store/adapter/base module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "troopjs-core/component/gadget" ], function BaseAdapterModule(Gadget) {
	var STORAGE = "storage";

	return Gadget.extend({
		"displayName" : "browser/store/adapter/base",

		"afterPut" : function (key, value) {
			this[STORAGE].setItem(key, JSON.stringify(value));

			return value;
		},

		"beforeGet" : function get(key) {
			return JSON.parse(this[STORAGE].getItem(key));
		},

		"clear" : function clear() {
			return this[STORAGE].clear();
		}
	});
});