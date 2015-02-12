define([
	"../component",
	"jquery"
], function (Component, $) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	buster.testCase("troopjs-dom/component", {
		"setUp": function () {
			this.$el = $("<form />");
		},

		"dynamic DOM events": {
			"add &amp; remove": function () {
				var $el = this.$el;
				var click1 = this.spy();
				var click2 = this.spy();
				var component = Component($el);

				component.on("dom/click", click1);
				component.on("dom/click", click2);

				$el.click();

				assert.calledOnce(click1);
				assert.calledOnce(click2);

				component.off("dom/click", click1);

				$el.click();

				assert.calledOnce(click1);
				assert.calledTwice(click2);

				component.off("dom/click");

				$el.click();

				assert.calledOnce(click1);
				assert.calledTwice(click2);
			},

			"bubble": function () {
				var $el = this.$el;
				var $input = $("<input />").appendTo($el);
				var change1 = this.spy();
				var change2 = this.spy();

				Component($el).on("dom/change", change1);
				Component($input).on("dom/change", change2);

				$input.change();

				assert.calledOnce(change1);
				assert.calledOnce(change2);

				$el.change();

				assert.calledTwice(change1);
				assert.calledOnce(change2);
			},

			"prevent bubble": function () {
				var $el = this.$el;
				var $input = $("<input />").appendTo($el);
				var change1 = this.spy();
				var change2 = this.spy(function () {
					return false;
				});

				Component($el).on("dom/change", change1);
				Component($input).on("dom/change", change2);

				$input.change();

				refute.called(change1);
				assert.calledOnce(change2);

				$el.change();

				assert.calledOnce(change1);
			},

			"stopPropagation": function () {
				var $el = this.$el;
				var $input = $("<input />").appendTo($el);
				var change1 = this.spy();
				var change2 = this.spy(function ($event) {
					$event.stopPropagation();
				});

				Component($el).on("dom/change", change1);
				Component($input).on("dom/change", change2);

				$input.change();

				refute.called(change1);
				assert.calledOnce(change2);

				$el.change();

				assert.calledOnce(change1);
			},

			"stopImmediatePropagation": function () {
				var $el = this.$el;
				var click1 = this.spy(function ($event) {
					$event.stopImmediatePropagation();
				});
				var click2 = this.spy();

				Component($el).on("dom/click", click1);
				Component($el).on("dom/click", click2);

				$el.click();

				assert.calledOnce(click1);
				refute.called(click2);
			},

			"delegation": function () {
				var $el = this.$el;
				var $div = $("<div></div>")
					.addClass("div1")
					.appendTo($el);
				var $input1 = $("<input />")
					.addClass("input1")
					.appendTo($div);
				var $input2 = $("<input />")
					.addClass("input2")
					.appendTo($div);
				var change1 = this.spy();
				var change2 = this.spy();
				var change3 = this.spy()

				var component = Component($el);
				component.on("dom/change", change1, ".input1");
				component.on("dom/change", change2, ".input2");
				component.on("dom/change", change3, ".div1");

				$input1.change();

				assert.calledOnce(change1);
				refute.called(change2);
				assert.calledOnce(change3);

				$input2.change();

				assert.calledOnce(change1);
				assert.calledOnce(change2);
				assert.calledTwice(change3);
			}
		},

		"render": {
			"html": function () {
				return Component($("<div>"))
					.html("THIS IS HTML", 1, 2, 3)
					.then(function (args) {
						assert.equals(args.length, 4);
						assert.isObject(args[0]);
						assert.equals(args[1], 1);
						assert.equals(args[2], 2);
						assert.equals(args[3], 3);
					});
			}
		},

		"tearDown": function () {
			this.$el.remove();
		}
	});
});
