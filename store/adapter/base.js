/**
 * TroopJS browser/store/adapter/base module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "troopjs-core/component/gadget" ], function BaseAdapterModule(Gadget) {
	var STORAGE = "storage";

	return Gadget.extend({
		"displayName" : "browser/store/adapter/base",

		"afterPut" : function (store, key, value) {
			this[STORAGE].setItem(key, JSON.stringify(value));
		},

		"beforeGet" : function get(store, key) {
			return store.put(key, JSON.parse(this[STORAGE].getItem(key)));
		},

		"clear" : function clear() {
			return this[STORAGE].clear();
		}
	});
});