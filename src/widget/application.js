/*!
 * TroopJS widget/application component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "../component/widget" ], function ApplicationModule(Widget) {
	/*jshint strict:false, laxbreak:true */

	var ARRAY_SLICE = Array.prototype.slice;

	return Widget.extend({
		displayName : "browser/widget/application",

		"sig/start" : function start() {
			var self = this;
			var arg = ARRAY_SLICE.call(arguments, 1);

			return arg.length > 0
				? self.weave.apply(self, arg)
				: self.weave();
		},

		"sig/stop" : function stop() {
			var self = this;
			var arg = ARRAY_SLICE.call(arguments, 1);

			return arg.length > 0
				? self.unweave.apply(self, arg)
				: self.unweave();
		}
	});
});