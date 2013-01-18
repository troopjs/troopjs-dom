/**
 * TroopJS browser/store/local module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "compose", "./base" ], function StoreLocalModule(Compose, Store) {
	return Compose.create(Store, {
		"displayName" : "browser/store/local",

		"storage" : window.localStorage
	});
});