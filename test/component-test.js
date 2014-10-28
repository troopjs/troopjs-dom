/*globals buster:false*/
buster.testCase("troopjs-dom/component", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	require( [ "troopjs-dom/component", "jquery" ] , function (Component, $) {


		run({
			"setUp": function () {
				this.$el = $("<form />");
			},

			"direct event": function () {
				var $el = this.$el;
				var click = this.spy();

				Component($el).on("dom/click", click);

				$el.click();
				assert.calledOnce(click);
				$el.click();
				assert.calledTwice(click);
			},

			"direct event - multiple handlers": function () {
				var $el = this.$el;
				var click1 = this.spy();
				var click2 = this.spy();

				Component($el)
					.on("dom/click", click1)
					.on("dom/click", click2);

				$el.click();
				assert.calledOnce(click1);
				assert.calledOnce(click2);
				$el.click();
				assert.calledTwice(click1);
				assert.calledTwice(click2);
			},

			"delegated event": function () {
				var $el = this.$el;
				var $input = $("<input />").appendTo($el);
				var change = this.spy();

				Component($el).on("dom/change", change);

				$input.change();
				assert.calledOnce(change);
				$input.change();
				assert.calledTwice(change);
			},

			"delegated event - bubble": function () {
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

			"delegated event - prevent bubble": function () {
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

			"delegated event - stopPropagation": function () {
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

			"tearDown": function () {
				this.$el.remove();
			}
		});
	});
});
