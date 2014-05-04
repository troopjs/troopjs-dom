/*
 * TroopJS dom/application/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "troopjs-dom/component/widget", "when"], function FooWidgetModule(Widget, when) {
	"use strict";

	var assert = buster.referee.assert;

	/**
	 * A simple widget for test.
	 */
	return Widget.extend({
		"sig/start": function() {
			// start signal shall not be called.
			assert(false);
		}
	});
});
