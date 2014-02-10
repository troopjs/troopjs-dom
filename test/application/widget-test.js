/*globals buster:false*/
buster.testCase("troopjs-browser/application/widget", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	require( [
		"troopjs-browser/application/widget",
		"text!troopjs-browser/test/application/page.html",
		"jquery"
	],
		function (Application, html, $) {

		function assertWidgets (widgets, widgets2) {
			assert.same(2, widgets.length);
			assert.same(1, widgets2.length);
			var foo = widgets[0];
			var bar = widgets[1];
			var baz = widgets2[0];
			assert.same("troopjs-browser/test/component/foo", foo.displayName);
			assert.same("troopjs-browser/test/component/bar", bar.displayName);
			assert.same("troopjs-browser/test/component/baz", baz.displayName);
		}

		var app;
		run({
			"setUp": function () {
				this.$el = $(html).appendTo("body");

				app = Application($('html'));
			},
			"weaving": function () {
				return app.weave(456, 'def').spread(assertWidgets).then(function () {
						return app.unweave().spread(assertWidgets);
				});
			},
			"tearDown": function () {
				this.$el.remove();
			}
		});
	});
});
