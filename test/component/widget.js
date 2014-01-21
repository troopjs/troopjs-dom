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

			"single widget, no parameter": {
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
				},
				"tearDown": function () {
					$('body').html('');
				}
			},

			"two widgets, one with parameters": {
				"weaving": function (done) {
					this.timeout = 500;
					var $el = $('.foobar');
					$el.weave(456, 'def').spread(function (widgets) {

						// Two widgets received.
						var foo = widgets[0];
						var bar = widgets[1];

						// Two widgets should share the same DOM element.
						assert.same($el.get(0), foo.$element.get(0));
						assert.same($el.get(0), bar.$element.get(0));

						// The woven attribute should consist of two widgets.
						assert.same([foo.toString(),bar.toString()].join(' '), $el.attr('data-woven'));

						assert.same('started', foo.phase);
						assert.same('started', bar.phase);
						done();
					});
				}
			}
		});
	});
});
