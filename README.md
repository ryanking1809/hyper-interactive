# hyper-interactive
Events triggered on complex mouse and keyboard interactions.

    npm install simple-spring

## How to use

#### Import Spring

```js
import HyperInteractive from "hyper-interactive";
```

#### Wrap target element to watch for events

```js
const hyper = new HyperInteractive(document);
```

#### Add interaction events

You can add events using `.addInteractions()` or a single event using `.addInteraction`.

```js
hyper.addInteraction({
  formula: "a",
  reaction: () => alert("a key was pressed!")
});
```

#### Add more complicated interactions

You can get quite complex with you interaction codes, allowing you to enter sequences and combinations of keys

```js
hyper.addInteractions([
	{
		formula: "space+b",
		reaction: () => alert("spacebar and b keys were both pressed!")
	},
	{
		formula: "[|]",
		reaction: () => alert("[ or ] key was both pressed!")
	},
	{
		formula: "k o n a m i",
		reaction: () => alert("konami was typed!")
	},
	{
		formula: "esc+(k o n a m i)",
		reaction: () => alert("konami was typed whilst holding the escape key!")
	}
]);
```

## Interaction formulas

#### Key Combos

Using a `+` symbol you can create an event when a combination of keys are pressed. This is not just limited to the standard modifier keys but can be any key combination. The following are all valid formulas.

```
shift+a
a+b
space+F10
```

#### Or operators

Using the `|` you can create an or operator. The formula `a|b` will trigger an event if either a or b is pressed.

#### Konami code

You can create an event based on a sequence of key presses using a space ` ` inbetween codes. You can even combine it with the syntax above. Try the following.

```
h e l l o
space+(h e l l o)
a b+c d|e f g
```

#### Brackets

You can use brackets to control the order of evaluation.
For example `a+(b|c|d)` will check `a` is pressed and any of `b`, `c`, or `d` is pressed.
`(a+b)|c|d` will check if `a` and `b` are pressed together or `c` or `c` are pressed on their own.

#### Not Operator

An `!` can be used to exclude keys. `!(a|b)` will fire any time a key is pressed that is not `a` or `b`. You could use this in combination, `a+b+!c+!d` will be triggered if `a` and `b` are down but only if `c` and `d` are not.

## Available Keys

| KeyCode | Description |
| ----------- | ----------- |
| * | Any Key |
| esc | Escape Key |

...under construction