/**
 * TroopJS browser/application/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "module", "../component/widget", "when", "troopjs-core/registry/service", "poly/array" ], function ApplicationWidgetModule(module, Widget, when, RegistryService) {
	/*jshint laxbreak:true */

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var REGISTRY = "registry";

	function forward(signal) {
		var self = this;
		var args = ARRAY_SLICE.call(arguments);
		var services = self[REGISTRY].get();
		var service;
		var index = 0;

		function next() {
			// Return a chained promise of next signal, or a promise resolved with signal
			return (service = services[index++])
				? when(service.signal.apply(service, args), next)
				: when.resolve(signal);
		}

		return next();
	}

	return Widget.extend(function ApplicationWidget() {
		// Create registry
		var registry = this[REGISTRY] = RegistryService();

		// Slice and iterate children
		ARRAY_SLICE.call(arguments, 2).forEach(function (service) {
			// Register service
			registry.add(service);
		});
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