/*!
 * TroopJS route/widget module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/widget", "troopjs-utils/uri", "troopjs-jquery/hashchange" ], function RouteWidgetModule(Widget, URI) {
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
		"sig/initialize" : function initialize(signal, deferred) {
			var self = this;

			self.bind(HASHCHANGE, self, onHashChange);

			if (deferred) {
				deferred.resolve();
			}
		},

		"sig/start" : function start(signal, deferred) {
			this.trigger(HASHCHANGE);

			if (deferred) {
				deferred.resolve();
			}
		},

		"sig/finalize" : function finalize(signal, deferred) {
			this.unbind(HASHCHANGE, onHashChange);

			if (deferred) {
				deferred.resolve();
			}
		}
	});
});