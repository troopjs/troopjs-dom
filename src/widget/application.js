/*!
 * TroopJS widget/application component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "../component/widget" ], function ApplicationModule(Widget) {
	/*jshint strict:false */

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