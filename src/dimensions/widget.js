/*!
 * TroopJS dimensions/widget module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "../component/widget", "troopjs-jquery/dimensions", "troopjs-jquery/resize" ], function DimensionsModule(Widget) {
	var DIMENSIONS = "dimensions";
	function onDimensions($event, w, h) {
		var self = $event.data;

		self.publish(self.displayName, w, h, $event);
	}

	return Widget.extend(function DimensionsWidget($element, displayName, dimensions) {
		this[DIMENSIONS] = dimensions;
	}, {
		"displayName" : "browser/dimensions/widget",

		"sig/initialize" : function initialize() {
			var self = this;

			self.$on(DIMENSIONS + "." + self[DIMENSIONS], self, onDimensions);
		},

		"sig/start" : function start() {
			this.$emit("resize." + DIMENSIONS);
		},

		"sig/finalize" : function finalize() {
			var self = this;

			self.$off(DIMENSIONS + "." + self[DIMENSIONS], onDimensions);
		}
	});
});