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

		"sig/start" : function start() {
			return this.weave();
		},

		"sig/stop" : function stop() {
			return this.unweave();
		}
	});
});