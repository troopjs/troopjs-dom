/*!
 * TroopJS store/local module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "compose", "./base" ], function StoreLocalModule(Compose, Store) {
	/*jshint strict:false */

	return Compose.create(Store, {
		displayName : "browser/store/local",

		storage : window.localStorage
	});
});