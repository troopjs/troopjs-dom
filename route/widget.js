/**
 * TroopJS browser/route/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../component/widget", "./uri", "troopjs-jquery/hashchange" ], function RouteWidgetModule(Widget, URI) {
	"use strict";
	var $ELEMENT = "$element";
	var HASHCHANGE = "hashchange";
	var ROUTE = "route";
	var SET = "/set";
	var RE = /^#/;

	function onHashChange($event) {
		var me = $event.data;

		// Create URI
		var uri = URI($event.target.location.hash.replace(RE, ""));

		// Convert to string
		var route = uri.toString();

		// Did anything change?
		if (route !== me[ROUTE]) {
			// Store new value
			me[ROUTE] = route;

			// Publish route
			me.publish(me.displayName, uri, $event);
		}
	}

	function setRoute(uri) {
		this[$ELEMENT].get(0).location.hash = uri.toString();
	}

	return Widget.extend({
		"displayName" : "browser/route/widget",

		"sig/initialize" : function initialize() {
			var me = this;

			// Add DOM event handler
			me[$ELEMENT].on(HASHCHANGE, me, onHashChange);

			// Add HUB event handler
			me.subscribe(me.displayName + SET, setRoute);
		},

		"sig/start" : function start() {
			this[$ELEMENT].trigger(HASHCHANGE);
		},

		"sig/finalize" : function finalize() {
			// Remove DOM event handler
			this[$ELEMENT].off(HASHCHANGE, onHashChange);

			// Remove HUB event handler
			me.unsubscribe(me.displayName + SET, setRoute);
		}
	});
});