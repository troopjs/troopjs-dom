# TroopJS Browser module

## Overview

The browser module are components that **weave** "behaviors" into DOM elements, generally reflected the "view" layer of
in a typical MVC pattern. Once a widget is attached to a DOM element on page, it delegates all interactions with the underlay
DOM element, listening for hub topics and to handle DOM events.

## Weaving

**weave** in terms of TroopJS is defined as the process of instantiating a widget component, starting it's life-circle
and to associate with an DOM element.

### declarative weave

declarative weave widgets are created through a custom HTML attribute `data-weave` on any element, where the attribute value
is string that points to one or more widget's module id. The following HTML code declares a simple widget to weave:

```
 <div id="foo" data-weave="my-app/widget/inc"></div>
```

Then it's the containing element of the above HTML, that is responsible for weaving in the widgets as soon as:

 - The parent element's {@link browser.component.widget#weave} method is called that will weave all children.
 - The HTML is created by the parent element's {@link browser.component.widget#html} method that will weave all children.

### programming weave

If there's any case where you'd like to weave widgets dynamically, there exists a few options:

You can weave by instantiate any widget, passing the element as argument, and start it after then.

```
require('troopjs-browser/loom/weave', function(weave){
	$('#foo').attr('data-weave', 'my-app/widget/inc');
	weave.call($('#foo'), 'other arguments that are passed to #start').then(function onWeaved(widgets){
		// the woven widget received.
		console.log(widgets[0]);
	});
});
```

Alternatively, since all loom methods live as jQuery plugins, if you don't really care when the weaving has completed,
it is straight forward to weave an element by calling {@link $.fn#method-weave}, passing in additional parameters as well:

```
$('#foo').attr('data-weave', 'my-app/widget/inc').weave()
```

### single element, multiple widgets

Not only a single widget that you can weave on an element, multiple widgets could be sharing the same element, implements
different features that eventually composed as layers. The following example that weaves two widgets that plays the submit
and validation behaviors correspondingly on an element:

```
<form id="foo" data-weave="my-app/widget/submit,my-app/widget/validation"></form>
```

```
$('#foo').weave();
```

## Widget

Browser widgets are component extended from {@link browser.component.widget} that handles hub topics, DOM events, and
responsible for interacting with the underlay DOM element referenced by {@link browser.component.widget#property-$element}.

Widget communicates with the outside through hub topics like any other {@link browser.component.gadget}, generally subscribing
to the hub declarative and publish to the hub from {@link browser.component.widget#publish}, other than regular gadgets,
the widgets are likely to delegate the DOM events handling using "dom" specials, which takes the format of - `"dom:({selector})/{type}" : handler`,
where `{selector}` is a jQuery selector and `{type}` is the event type, equivalently with binding a event on jQuery event
on the element via `this.$element.on('{type}', '{selector}', handler)`.

The following JavaScript module illustrated a simple widget that display and increments any number received:

```
define('my-app/widget/inc', ['troopjs-browser/component/widget'], function IncWidget(Widget) {
	return Widget.extend(function($element, name){
		console.log("started widget %s on element %o", name, $element);
	},
	{
		"hub/input": function(num){
			this.$element.html('<button class="inc">' + num + '</button>');
		}
		"dom:.inc/click": function(){
			var num = this.$element.text();
			this.publish('hub/output', num+1);
		}
	});
});
```

## Unweave

When a DOM widget is not considered to be useful anymore, either because it has been removed from the DOM tree, or you call
{@link browser.component.widget#unweave} manually it will **unweave** widgets that are woven on the element, which basically
stopped the widget and detaches it from the DOM element, allows it for being garbage-collected.

```
$('#foo').unweave();
```

You don't have to unweave all widgets live on the element once, using the `data-unweave` custom attribute you're able to
selectively unweave a certain widgets only, the following code remove only the "validation" widget on element while remains
the form submitting widget functional.

```
<form id="foo" data-weave="my-app/widget/submit,my-app/widget/validation"></form>
```

```
$('#foo').attr('data-unweave', 'my-app/widget/validation').unweave();
```
