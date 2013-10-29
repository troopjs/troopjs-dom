/**
 * TroopJS browser/hash/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"../component/widget",
	"troopjs-core/net/uri",
	"troopjs-jquery/hashchange"
], function (Widget, URI) {
	"use strict";

	var $ELEMENT = "$element";
	var HASH = "_hash";
	var RE = /^#/;

	return Widget.extend({
		"displayName" : "browser/hash/widget",

		"sig/start" : function () {
			this[$ELEMENT].trigger("hashchange");
		},

		"dom/hashchange" : function ($event) {
			var me = this;

			// Create URI
			var uri = URI(me[$ELEMENT].get(0).location.hash.replace(RE, ""));

			// Convert to string
			var hash = uri.toString();

			// Did anything change?
			if (hash !== me[HASH]) {
				// Store new value
				me[HASH] = hash;

				// Update $event.uri
				$event.uri = uri;
			}
			else {
				// Prevent further hashchange handlers from receiving this
				$event.stopImmediatePropagation()
			}
		},

		"dom/hashset" : function ($event, uri) {
			/* jshint validthis:true */
			this[$ELEMENT].get(0).location.hash = uri.toString();
		}
	});
});