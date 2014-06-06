/*
 * TroopJS dom/application/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "troopjs-dom/component/widget", "when"], function FooWidgetModule(Widget, when) {
	"use strict";
	function error() {
		throw Error("start failure");
	}

	/**
	 * A simple widget that throws on start.
	 */
	return Widget.extend({
		"sig/initialize": error,
		"sig/start": error
	});
});
