export default {
  // special keys
  "*": "any",
  ctrl: "(ControlLeft|ControlRight)",
  control: "(ControlLeft|ControlRight)",
  meta: "(MetaLeft|MetaRight)",
  command: "(MetaLeft|MetaRight)",
  cmd: "(MetaLeft|MetaRight)",
  alt: "(AltLeft|AltRight)",
  option: "(AltLeft|AltRight)",
  opt: "(AltLeft|AltRight)",
  shift: "(ShiftLeft|ShiftRight)",
  mod: /Mac|iPod|iPhone|iPad/.test(navigator.platform)
    ? "(MetaLeft|MetaRight)"
    : "(ControlLeft|ControlRight)",
  modifier: /Mac|iPod|iPhone|iPad/.test(navigator.platform)
    ? "(MetaLeft|MetaRight)"
    : "(ControlLeft|ControlRight)",
  _: "Space",
  esc: "Escape",
  del: "(Backspace|Delete)",
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  //special chars
  "-": "Minus",
  "=": "Equal",
  "[": "BracketLeft",
  "]": "BracketRight",
  ";": "Semicolon",
  "'": "Quote",
  "\\": "Backslash",
  ",": "Comma",
  ".": "Period",
  "/": "slash",
  // numbers
  "1": "Digit1",
  "2": "Digit2",
  "3": "Digit3",
  "4": "Digit4",
  "5": "Digit5",
  "6": "Digit6",
  "7": "Digit7",
  "8": "Digit8",
  "9": "Digit9",
  "0": "Digit0",
  // chars - row1
  q: "KeyQ",
  w: "KeyW",
  e: "KeyE",
  r: "KeyR",
  t: "KeyT",
  y: "KeyY",
  u: "KeyU",
  i: "KeyI",
  o: "KeyO",
  p: "KeyP",
  // row2
  a: "KeyA",
  s: "KeyS",
  d: "KeyD",
  f: "KeyF",
  g: "KeyG",
  h: "KeyH",
  j: "KeyJ",
  k: "KeyK",
  l: "KeyL",
  // row3
  z: "KeyZ",
  x: "KeyX",
  c: "KeyC",
  v: "KeyV",
  b: "KeyB",
  n: "KeyN",
  m: "KeyM"
};