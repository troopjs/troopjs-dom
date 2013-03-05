/**
 * TroopJS browser/ajax/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "troopjs-core/component/service", "jquery", "troopjs-utils/merge" ], function AjaxModule(Service, $, merge) {
	return Service.extend({
		"displayName" : "browser/ajax/service",

		"hub/ajax" : function ajax(settings) {
			// Request
			return $.ajax(merge.call({
				"headers": {
					"x-request-id": new Date().getTime()
				}
			}, settings));
		}
	});
});