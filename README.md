# hyper-interactive
Events triggered on complex mouse and keyboard interactions.

Inspired by `mousetrap`, `hyper-interactive` is more flexible - It allows any key to act as a modifier, has parentheses and not operations, and allows to combine your event formulas in an almost infinite number of ways.

    npm install hyper-interactive

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

You can add events using `.addInteractions()` or a single event using `.addInteraction()`.

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
		reaction: () => alert("[ or ] key was pressed!")
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

Using the `|` you can create an or operator. The formula `a|b` will trigger an event if either `a` or `b` is pressed.

#### Konami code

You can create an event based on a sequence of key presses using a space inbetween codes. You can even combine it with the syntax above. Try the following.

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

You can use any `KeyEvent.code` value as a key, along with the following aliases, all case insensitive. A `KeyEvent.keyCode` fallback has been provided for older browsers.

| KeyCode | Description |
| ----------- | ----------- |
| * , any | Any |
| shift | ShiftLeft or ShiftRight |
| ctrl , control | ControlLeft or ControlRight |
| alt , opt , option | AltLeft or AltRight |
| meta , cmd , command | MetaLeft or MetaRight |
| mod , modifier | Meta for Apple devices, Control for others |
| esc , escape | Escape |
| _ , space | Space |
| del | Backspace or Delete |
| up | ArrowUp |
| down | ArrowDown |
| left | ArrowLeft |
| right | ArrowRight |
| - | Minus |
| = | Equal |
| [ | BracketLeft |
| ] | BracketRight |
| ; | Semicolon |
| ' | Quote |
| \ | Backslash |
| , | Comma |
| . | Period |
| / | Slash |
| 0-9 | Digit0-Digit9 |
| a-z | KeyA-KeyZ |

While we patiently wait for `Keyboard.getLayoutMap()` you can pass different keyboard maps via the third argument of the `HyperInteractive` constructor.

```js
new HyperInteractive(target, interactions, keyboardMap)
```

Additionally you can use `.addKeyCodes()` to create additional key codes. These can use any formula value. For example.

```js
hyper.addKeyCodes({
    "?": "shift+/",
    "save": "mod+s"
})
```

## To do

- add mouse / pointer events
- provide additional keyboard layouts