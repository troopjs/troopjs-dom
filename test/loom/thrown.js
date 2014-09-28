/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "./default"], function (Widget) {
	"use strict";

	/**
	 * A simple widget that throws on initialize.
	 */
	return Widget.extend({
		"sig/initialize": function error() {
			throw new Error("initialize failure");
		}
	});
});
