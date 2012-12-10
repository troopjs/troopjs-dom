/*!
 * TroopJS route/widget module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "../component/widget", "troopjs-utils/uri", "troopjs-jquery/hashchange" ], function RouteWidgetModule(Widget, URI) {
	/*jshint strict:false */

	var HASHCHANGE = "hashchange";
	var ROUTE = "route";
	var RE = /^#/;

	function onHashChange($event) {
		var self = $event.data;

		// Create URI
		var uri = URI($event.target.location.hash.replace(RE, ""));

		// Convert to string
		var route = uri.toString();

		// Did anything change?
		if (route !== self[ROUTE]) {
			// Store new value
			self[ROUTE] = route;

			// Publish route
			self.publish(self.displayName, uri, $event);
		}
	}

	return Widget.extend({
		"sig/initialize" : function initialize() {
			var self = this;

			self.bind(HASHCHANGE, self, onHashChange);
		},

		"sig/start" : function start() {
			this.trigger(HASHCHANGE);
		},

		"sig/finalize" : function finalize() {
			this.unbind(HASHCHANGE, onHashChange);
		}
	});
});