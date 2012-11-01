/*!
 * TroopJS dimensions/widget module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:true */
define([ "../component/widget", "troopjs-jquery/dimensions", "troopjs-jquery/resize" ], function DimensionsModule(Widget) {
	var DIMENSIONS = "dimensions";
	function onDimensions($event, w, h) {
		var self = $event.data;

		self.publish(self.displayName, w, h, $event);
	}

	return Widget.extend(function DimensionsWidget($element, displayName, dimensions) {
		this[DIMENSIONS] = dimensions;
	}, {
		"sig/initialize" : function initialize(signal, deferred) {
			var self = this;

			self.bind(DIMENSIONS + "." + self[DIMENSIONS], self, onDimensions);

			if (deferred) {
				deferred.resolve();
			}
		},

		"sig/start" : function start(signal, deferred) {
			this.trigger("resize." + DIMENSIONS);

			if (deferred) {
				deferred.resolve();
			}
		},

		"sig/finalize" : function finalize(signal, deferred) {
			var self = this;

			self.unbind(DIMENSIONS + "." + self[DIMENSIONS], onDimensions);

			if (deferred) {
				deferred.resolve();
			}
		}
	});
});