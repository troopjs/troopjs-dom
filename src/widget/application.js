/*!
 * TroopJS widget/application component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:true */
define([ "../component/widget" ], function ApplicationModule(Widget) {
	return Widget.extend({
		displayName : "browser/widget/application",

		"sig/start" : function start(signal, deferred) {
			this.weave(deferred);
		},

		"sig/stop" : function stop(signal, deferred) {
			this.unweave(deferred);
		}
	});
});