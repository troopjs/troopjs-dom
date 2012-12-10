/*!
 * TroopJS widget/application component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "module", "../component/widget", "when" ], function ApplicationWidgetModule(module, Widget, when) {
	/*jshint strict:false, laxbreak:true */

	var CHILDREN = "children";

	function forward(signal) {
		var self = this;
		var args = arguments;
		var children = self[CHILDREN];
		var length = children ? children.length : 0;
		var index = 0;

		function next(_args) {
			args = _args || args;

			return length > index
				? when(children[index++].signal(signal), next)
				: when.resolve(args);
		}

		return next();
	}

	return Widget.extend(function ApplicationWidget($element, name, children) {
		this[CHILDREN] = children;
	}, {
		displayName : "browser/application/widget",

		"sig/initialize" : forward,
		"sig/start" : function start() {
			var self = this;

			forward.apply(self, arguments).spread(function started() {
				self.weave();
			});
		},
		"sig/stop" : function stop() {
			var self = this;

			self.unweave().spread(function stopped() {
				forward.apply(self, arguments);
			});
		},
		"sig/finalize" : forward
	});
});