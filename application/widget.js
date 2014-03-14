/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"module",
	"../component/widget",
	"when",
	"troopjs-core/registry/service",
	"poly/array"
], function ApplicationWidgetModule(module, Widget, when, RegistryService) {
	"use strict";

	/**
	 * The application widget serves as a container for all troop components that bootstrap the page.
	 * @class browser.application.widget
	 * @extends browser.component.widget
	 */

	var UNDEFINED;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var REGISTRY = "registry";

	/**
	 * Forwards _signal to components
	 * @ignore
	 * @param {String} _signal Signal to forward
	 * @param {Array} _args Signal arguments
	 * @return {Promise} promise of next handler callback execution
	 */
	function forward(_signal, _args) {
		/*jshint validthis:true*/
		var me = this;
		var args = [ _signal ];
		var components = me[REGISTRY].get();
		var componentsCount = 0;
		var results = [];
		var resultsCount = 0;

		ARRAY_PUSH.apply(args, _args);

		var next = function (result, skip) {
			var component;

			if (skip !== true) {
				results[resultsCount++] = result;
			}

			return (component = components[componentsCount++]) !== UNDEFINED
				? when(component.signal.apply(component, args), next)
				: when.resolve(results);
		};

		return next(UNDEFINED, true);
	}

	/**
	 * @method constructor
	 * @inheritdoc
	 * @param {jQuery|HTMLElement} $element The element that this widget should be attached to
	 * @param {String} displayName A friendly name for this widget
	 * @param {...core.component.gadget} gadget List of gadgets to start before starting the application.
	 */
	return Widget.extend(function ApplicationWidget($element, displayName, gadget) {
		/**
		 * Service registry
		 * @private
		 * @readonly
		 * @property {core.registry.service} registry
		 */
		var registry = this[REGISTRY] = RegistryService();

		// TODO only register _services_
		// Slice and iterate arguments
		ARRAY_SLICE.call(arguments, 2).forEach(function (component) {
			// Register component
			registry.add(component);
		});
	}, {
		"displayName" : "browser/application/widget",

		/**
		 * @handler
		 * @localdoc Initialize all registered components (widgets and services) that are passed in from the {@link #method-constructor}.
		 * @inheritdoc
		 */
		"sig/initialize" : function onInitialize() {
			return forward.call(this, "initialize", arguments);
		},

		/**
		 * @handler
		 * @localdoc weave all widgets that are within this element.
		 * @inheritdoc
		 */
		"sig/start" : function onStart() {
			var me = this;
			var args = arguments;

			return forward.call(me, "start", args).then(function started() {
				return me.weave.apply(me, args);
			});
		},

		/**
		 * @handler
		 * @localdoc stop all woven widgets that are within this element.
		 * @inheritdoc
		 */
		"sig/stop" : function onStop() {
			var me = this;
			var args = arguments;

			return me.unweave.apply(me, args).then(function stopped() {
				return forward.call(me, "stop", args);
			});
		},

		/**
		 * @handler
		 * @localdoc finalize all registered components (widgets and services) that are registered from the {@link #method-constructor}.
		 * @inheritdoc
		 */
		"sig/finalize" : function onFinalize() {
			return forward.call(this, "finalize", arguments);
		}
	});
});
