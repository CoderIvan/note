# Box display types

Everything we've said so far applies to boxes that represent block level elements. However, CSS has other types of boxes that behave differently. The type of box applied to an element is specified by the display property.

## Common display types

There are many different values available for display, the three most common ones of which are `block`, `inline`, and `inline-block`.

* A `block` box is defined as a box that's stacked upon other boxes (i.e. content before and after the box appears on a separate line), and can have width and height set on it. The whole box model as described above applies to block boxes.
* An `inline` box is the opposite of a block box: it flows with the document's text (i.e. it will appear on the same line as surrounding text and other inline elements, and its content will break with the flow of the text, like lines of text in a paragraph.) Width and height settings have no effect on inline boxes; any padding, margin and border set on inline boxes will update the position of surrounding text, but will not affect the position of surrounding block boxes.
* An `inline-block` box is something in between the first two: It flows with surrounding text without creating line breaks before and after it like an inline box, but it can be sized using width and height and maintains its block integrity like a block box — it won't be broken across paragraph lines (an inline-block box that overflows a line of text will drop down onto a 2nd line, as there is not enough space for it on the first line, and it won't break across two lines.)

By default, block level elements have `display: block`; set on them, and inline elements have `display: inline`; set on them.

## Uncommon display types

There are also some less commonly-used values for the display property that you will come across in your travels. Some of these have been around for a while and are fairly well supported, while others are newer and less well supported. These values were generally created to make creating web page/application layouts easier. The most interesting ones are:

* `display: table` — allows you to emulate table layouts using non-table elements, without abusing table HTML to do so. To read more about this, See CSS tables.
* `display: flex` — allows you to solve many classic layout problems that have plagued CSS for a long time, such as laying out a series of containers in flexible equal width columns, or vertically centering content. For more information, see Flexbox.
* `display: grid` — gives CSS a native way of easily implementing grid systems, whereas it has traditionally relied on somewhat hack-ish CSS grid frameworks. Our CSS Grids article explains how to use traditional CSS grid frameworks, and gives a sneak peek at native CSS Grids.

## Other

#### The inline-block Value
It has been possible for a long time to create a grid of boxes that fills the browser width and wraps nicely (when the browser is resized), by using the float property.

However, the inline-block value of the display property makes this even easier.

inline-block elements are like inline elements but they can have a width and a height.

# References

> https://developer.mozilla.org/en-US/docs/Learn/CSS/Styling_boxes/Box_model_recap
