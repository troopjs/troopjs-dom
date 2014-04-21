/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../component/widget",
	"when"
], function ApplicationWidgetModule(Widget, when) {
	"use strict";

	/**
	 * The application widget serves as a container for all troop components that bootstrap the page.
	 * @class dom.application.widget
	 * @extend dom.component.widget
	 * @alias widget.application
	 */

	var ARRAY_SLICE = Array.prototype.slice;
	var COMPONENTS = "components";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @param {jQuery|HTMLElement} $element The element that this widget should be attached to
	 * @param {String} displayName A friendly name for this widget
	 * @param {...core.component.base} component List of components to start before starting the application.
	 */
	return Widget.extend(function ApplicationWidget($element, displayName, component) {
		/**
		 * Application components
		 * @private
		 * @readonly
		 * @property {core.component.base[]} components
		 */
		this[COMPONENTS] = ARRAY_SLICE.call(arguments, 2);
	}, {
		"displayName" : "dom/application/widget",

		/**
		 * @handler
		 * @localdoc Initialize all registered components (widgets and services) that are passed in from the {@link #method-constructor}.
		 * @inheritdoc
		 */
		"sig/initialize" : function onInitialize() {
			var args = arguments;

			return when.map(this[COMPONENTS], function (component) {
				return component.signal("initialize", args);
			});
		},

		/**
		 * @handler
		 * @localdoc weave all widgets that are within this element.
		 * @inheritdoc
		 */
		"sig/start" : function onStart() {
			var me = this;
			var args = arguments;

			return when
				.map(me[COMPONENTS], function (component) {
					return component.signal("start", args);
				}).then(function started() {
					return me.weave.apply(me, args);
				});
		},

		/**
		 * @handler
		 * @localdoc stop all woven widgets that are within this element.
		 * @inheritdoc
		 */
		"sig/stop": function onStop() {
			var me = this;
			var args = arguments;

			return me.unweave.apply(me, args).then(function stopped() {
				return when.map(me[COMPONENTS], function (child) {
					return child.signal("stop", args);
				});
			});
		},

		/**
		 * @handler
		 * @localdoc finalize all registered components (widgets and services) that are registered from the {@link #method-constructor}.
		 * @inheritdoc
		 */
		"sig/finalize" : function onFinalize() {
			var args = arguments;

			return when.map(this[COMPONENTS], function (component) {
				return component.signal("finalize", args);
			});
		}
	});
});
