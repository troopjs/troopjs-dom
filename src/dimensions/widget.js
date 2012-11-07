/*!
 * TroopJS dimensions/widget module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "../component/widget", "troopjs-jquery/dimensions", "troopjs-jquery/resize" ], function DimensionsModule(Widget) {
	/*jshint strict:false */

	var DIMENSIONS = "dimensions";
	function onDimensions($event, w, h) {
		var self = $event.data;

		self.publish(self.displayName, w, h, $event);
	}

	return Widget.extend(function DimensionsWidget($element, displayName, dimensions) {
		this[DIMENSIONS] = dimensions;
	}, {
		"sig/initialize" : function initialize(signal) {
			var self = this;

			self.bind(DIMENSIONS + "." + self[DIMENSIONS], self, onDimensions);

			return self;
		},

		"sig/start" : function start(signal) {
			var self = this;

			self.trigger("resize." + DIMENSIONS);

			return self;
		},

		"sig/finalize" : function finalize(signal) {
			var self = this;

			self.unbind(DIMENSIONS + "." + self[DIMENSIONS], onDimensions);

			return self;
		}
	});
});