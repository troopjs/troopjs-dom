define([
  "buster",
  "../component",
  "../error",
  "jquery"
], function (buster, Component, DOMError, $) {
  "use strict";

  var assert = buster.referee.assert;
  var refute = buster.referee.refute;

  buster.testCase("troopjs-dom/component", {
    "setUp": function () {
      this.$el = $("<form />");
    },

    "throws": {
      "when no $element is provided": function () {
        assert.exception(function () {
          Component();
        });
      },

      "DOMError": function () {
        assert.exception(function () {
          Component();
        }, function (e) {
          return e instanceof DOMError;
        });
      }
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
        var change3 = this.spy();

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
      "text": function () {
        var $element = $("<div>");

        return Component($element)
          .text("THIS IS TEXT", 1, "two")
          .spread(function ($text, one, two) {
            assert.equals(arguments.length, 3);
            assert.isArrayLike($text);
            assert.equals(one, 1);
            assert.equals(two, "two");
            assert.equals($text.get(0).textContent, "THIS IS TEXT");
            assert.equals($element.get(0).outerHTML, "<div>THIS IS TEXT</div>");
          });
      },

      "html": function () {
        var $element = $("<div>");

        return Component($element)
          .html("<span>THIS IS HTML</span>", 1, "two")
          .spread(function ($html, one, two) {
            assert.equals(arguments.length, 3);
            assert.isArrayLike($html);
            assert.equals(one, 1);
            assert.equals(two, "two");
            assert.equals($html.get(0).outerHTML, "<span>THIS IS HTML</span>");
            assert.equals($element.get(0).outerHTML, "<div><span>THIS IS HTML</span></div>");
          });
      },

      "appendTo": function () {
        var $element = $("<div>");

        return Component($("<p>"))
          .appendTo($element, "<span>THIS IS HTML</span>", 1, "two")
          .spread(function ($html, one, two) {
            assert.equals(arguments.length, 3);
            assert.isArrayLike($html);
            assert.equals(one, 1);
            assert.equals(two, "two");
            assert.equals($html.get(0).outerHTML, "<span>THIS IS HTML</span>");
            assert.equals($element.get(0).outerHTML, "<div><span>THIS IS HTML</span></div>");
          });
      }
    },

    "tearDown": function () {
      this.$el.remove();
    }
  });
});
