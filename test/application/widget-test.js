/*globals buster:false*/
buster.testCase("troopjs-dom/application/widget", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	require( [
		"troopjs-dom/application/widget",
		"text!troopjs-dom/test/application/page.html",
		"jquery"
	],
		function (Application, html, $) {

		function assertWidgets (widgets1, widgets2) {
			assert.equals(widgets1.length, 2);
			assert.equals(widgets2.length, 1);
			assert.equals(widgets1[0].displayName, "troopjs-dom/test/component/foo");
			assert.equals(widgets1[1].displayName, "troopjs-dom/test/component/bar");
			assert.equals(widgets2[0].displayName, "troopjs-dom/test/component/baz");
		}

		run({
			"setUp": function () {
				this.$el = $(html).appendTo("body");
				this.app = Application($('html'));
				this.timeout = 1000;
			},
			"weaving": function () {
				var app = this.app;

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
