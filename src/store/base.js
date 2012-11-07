/*!
 * TroopJS store/base module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "compose", "troopjs-core/component/gadget", "when" ], function StoreModule(Compose, Gadget, when) {
	/*jshint strict:false */

	var STORAGE = "storage";

	return Gadget.extend({
		storage : Compose.required,

		set : function set(key, value) {
			// JSON encoded 'value' then store as 'key'
			return when(this[STORAGE].setItem(key, JSON.stringify(value)))
		},

		get : function get(key) {
			// Get value from 'key', parse JSON
			return when(JSON.parse(this[STORAGE].getItem(key)));
		},

		remove : function remove(key) {
			// Remove key
			return when(this[STORAGE].removeItem(key));
		},

		clear : function clear() {
			// Clear
			return when(this[STORAGE].clear());
		}
	});
});