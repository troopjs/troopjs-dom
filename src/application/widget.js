/**
 * TroopJS browser/application/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "module", "../component/widget", "when", "troopjs-core/registry/service" ], function ApplicationWidgetModule(module, Widget, when, RegistryService) {
	/*jshint laxbreak:true */

	var CHILDREN = "children";
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;

	function forward(signal) {
		var self = this;
		var _signal = self.signal;
		var children = self[CHILDREN];
		var length = children
			? children.length
			: 0;
		var index = 0;
		var args = ARRAY_SLICE.call(arguments);

		function next() {
			// Return a chained promise of next callback, or a promise resolved with args
			return length > index
				? when(_signal.apply(children[index++], args), next)
				: when.resolve(signal);
		}

		return next();
	}

	return Widget.extend(function ApplicationWidget($element, name, children) {
		this[CHILDREN] = children
			? ARRAY_PROTO.concat(RegistryService(), children)
			: [ RegistryService() ];
	}, {
		"displayName" : "browser/application/widget",

		"sig/initialize" : forward,
		"sig/start" : function start() {
			var self = this;
			var _weave = self.weave;
			var args = arguments;

			return forward.apply(self, args).then(function started() {
				return _weave.apply(self, ARRAY_SLICE.call(args, 1));
			});
		},
		"sig/stop" : function stop() {
			var self = this;
			var _unweave = self.unweave;
			var args = arguments;

			return _unweave.apply(self, ARRAY_SLICE.call(args, 1)).then(function stopped() {
				return forward.apply(self, args);
			});
		},
		"sig/finalize" : forward
	});
});