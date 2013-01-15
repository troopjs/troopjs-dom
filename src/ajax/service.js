/*!
 * TroopJS ajax/service module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "troopjs-core/component/service", "jquery", "troopjs-utils/merge" ], function AjaxModule(Service, $, merge) {
	var TRACE = "trace";

	return Service.extend({
		"displayName" : "browser/ajax/service",

		"hub/ajax" : function ajax(topic, settings) {
			// Request
			return $.ajax(merge.call({
				"headers": {
					"x-request-id": new Date().getTime(),
					"x-components": topic[TRACE] instanceof Function ? topic[TRACE]() : topic
				}
			}, settings));
		}
	});
});