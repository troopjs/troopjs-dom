/*
 * TroopJS dom/application/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "troopjs-dom/component/widget", "when"], function FooWidgetModule(Widget, when) {
	"use strict";

	/**
	 * A simple widget for test.
	 */
	return Widget.extend({
		"displayName" : "test/component/widget/foo",
		"sig/start": function() {
			return when(1).delay(500);
		}
	});
});
