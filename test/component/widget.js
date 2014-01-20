/*globals buster:false*/
buster.testCase("troopjs-browser/component/widget", function (run) {
	"use strict";

	var assert = buster.referee.assert,
		refute = buster.referee.refute;

	require( [
		"troopjs-browser/component/widget",
		"text!troopjs-browser/test/component/widget.html",
		"jquery"
	],
		function (Widget, html, $) {

		run({
			"setUp": function () {
				$('body').append(html);
			},
			"weaving": function (done) {
				this.timeout = 500;
				var $el = $('.foo');
				$el.weave().spread(function (widgets) {
					var widget = widgets[0];
					assert("troopjs-browser/component/widget", widget.displayName);
					var $el = widget.$element;
					assert.same(widget.toString(), $el.attr('data-woven'));
					assert.same('started', widget.phase);
					done();
				});
			},
			"unweaving": function (done) {
				this.timeout = 500;
				var $el = $('.foo');
				$el.weave().then(function () {
					$el.unweave().then(function () {
						refute($el.attr('data-woven'));
						assert.same('troopjs-browser/test/component/foo', $el.attr('data-weave'));
						done();
					});

				});
			}
		});
	});
});
