/**
 * TroopJS browser/mvc/controller/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"../../component/widget",
	"../../hash/widget",
	"poly/object",
	"poly/array"
], function (Widget, Hash) {
	"use strict";

	var UNDEFINED;
	var CACHE = "_cache";
	var URI = "_uri";
	var OPT_SILENT = "silent";
	var DISPLAYNAME = "displayName";
	var ARRAY_SLICE = Array.prototype.slice;

	function extend() {
		var me = this;

		ARRAY_SLICE.call(arguments).forEach(function (arg) {
			Object.keys(arg).forEach(function (key) {
				me[key] = arg[key];
			});
		});

		return me;
	}

	function handleControl(requests, options) {
		var me = this;
		var displayName = me[DISPLAYNAME];
		var opt_silent = options && options[OPT_SILENT] === true

		return me.publish(displayName + "/requests", extend.call(me.uri2data(me[URI]), requests))
			.spread(function (_requests) {
				return me.request(_requests !== UNDEFINED ? _requests : requests, {})
					.then(function (results) {
						var cache = me[CACHE];
						var uri = me[URI] = me.data2uri(me[CACHE] = results);
						var updates = {};
						var updated = Object.keys(results).reduce(function (update, key) {
							if (cache[key] !== results[key]) {
								updates[key] = results[key];
								update = true;
							}

							return update;
						}, false);

						return me.publish(displayName + "/results", results)
							.then(function () {
								return updated && me.publish(displayName + "/updates", updates)
									.then(function () {
										// Trigger `hashset` but silently
										me.$element.trigger("hashset", [ uri, opt_silent ]);
									});
							})
							.yield(updates)
					});
			});
	}

	return Widget.extend(Hash, function () {
		this[CACHE] = {};
	}, {
		"displayName": "browser/mvc/controller/widget",

		"sig/initialize": function () {
			var me = this;

			me.subscribe(me[DISPLAYNAME], handleControl);
		},

		"sig/finalize": function () {
			var me = this;

			me.unsubscribe(me[DISPLAYNAME], handleControl);
		},

		"dom/urichange": function ($event, uri) {
			var me = this;

			me.publish(me[DISPLAYNAME], me.uri2data(me[URI] = uri));
		}
	});
});