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
		var cache = me[CACHE];
		var displayName = me[DISPLAYNAME];

		options = options || {};

		return me.publish(displayName + "/requests", extend.call(me.uri2data(me[URI]), requests))
			.spread(function (_requests) {
				return me.request(_requests !== UNDEFINED ? _requests : requests, {})
					.then(function (results) {

						me[URI] = me.data2uri(results);

						return me.publish(displayName + "/results", results)
							.then(function () {
								var updates = {};
								var updated = Object.keys(results).reduce(function (update, key) {
									if (cache[key] !== results[key]) {
										updates[key] = results[key];
										update = true;
									}

									return update;
								}, false);

								return updated
									? me.publish(displayName + "/updates", updates)
										.then(function () {
											// Update cache
											me[CACHE] = results;

											// Trigger `hashset` but silently
											me.$element.trigger("hashset", [ me[URI] , options[OPT_SILENT] === true ]);
										})
										.yield(updates)
									: [ updates ];
							});
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