/*globals buster:false*/
buster.testCase("troopjs-browser/application/widget", function (run) {
	"use strict";

	var assert = buster.referee.assert,
		refute = buster.referee.refute;

	require( [
		"troopjs-browser/application/widget",
		"text!troopjs-browser/test/application/page.html",
		"jquery"
	],
		function (Application, html, $) {

		var app;
		run({
			"setUp": function () {
				$('body').html(html);
				app = Application($('html'));
			},
			"weaving": function (done) {
				this.timeout = 500;
				app.start().spread(function (widgets) {
					var widget = widgets[0];
					assert("troopjs-browser/component/widget", widget.displayName);
				}).then(function () {
						app.unweave().spread(function (fooWidgets) {
							var widget = fooWidgets[0];
							var $el = widget.$element;
							refute($el.attr('data-woven'));
							assert.same('troopjs-browser/test/component/foo', $el.attr('data-weave'));
							done();
						});
				});
			},
			"tearDown": function () {
				$('body').html('');
			}
		});
	});
});
