/**
 * TroopJS browser/store/session module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "compose", "./base" ], function StoreSessionModule(Compose, Store) {
	return Compose.create(Store, {
		"displayName" : "browser/store/session",

		"storage": window.sessionStorage
	});
});
