/*!
 * TroopJS store/session module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "compose", "./base" ], function StoreSessionModule(Compose, Store) {
	return Compose.create(Store, {
		displayName : "browser/store/session",

		storage: window.sessionStorage
	});
});
