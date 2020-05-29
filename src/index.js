import tuple from 'immutable-tuple'
import { parseFormula } from './parser/parseFormula'
import US from './keyboardMap/US'
import keyCodeMap from './keyboardMap/keyCodeMap'

const anyTarget = {}

export default class HyperInteractive {
  constructor({
    target = document,
    interactions = [],
    keyboardMap = US,
    codeMap = keyCodeMap,
    getTarget = (e) => e.target,
  } = {}) {
    this.target = target
    this.getTarget = getTarget.bind(this)
    this.keyboardMap = keyboardMap
    this.keyCodeMap = codeMap
    this.downKeys = new Set()
    this.eventHistory = []
    this.eventReactions = new WeakMap()

    this.artificialKeyUpTimes = {}

    this.addKeyCodes = this.addKeyCodes.bind(this)
    this.addInteractions = this.addInteractions.bind(this)

    this.isKeyDown = this.isKeyDown.bind(this)
    this.check = this.check.bind(this)

    this.addInteraction = this.addInteraction.bind(this)
    this.removeInteraction = this.addInteraction.bind(this)
    this.getNodeKeys = this.getNodeKeys.bind(this)

    this.checkEvent = this.checkEvent.bind(this)
    this.checkEventComboKeys = this.checkEventComboKeys.bind(this)
    this.getEventChecker = this.getEventChecker.bind(this)
    this.checkKonamiEvent = this.checkKonamiEvent.bind(this)
    this.getHistoryIndexBefore = this.getHistoryIndexBefore.bind(this)
    this.checkComboEvent = this.checkComboEvent.bind(this)
    this.checkOrEvent = this.checkOrEvent.bind(this)
    this.checkNotEvent = this.checkNotEvent.bind(this)
    this.checkKeyEvent = this.checkKeyEvent.bind(this)

    this.onKeydown = this.onKeydown.bind(this)
    this.onKeyup = this.onKeyup.bind(this)

    this.addToHistory = this.addToHistory.bind(this)
    this.addEventReaction = this.addEventReaction.bind(this)
    this.removeEventReaction = this.addEventReaction.bind(this)
    this.fireEventReactions = this.fireEventReactions.bind(this)
    this.fireReactions = this.fireReactions.bind(this)

    this.dispose = this.dispose.bind(this)

    target.addEventListener('keydown', this.onKeydown)
    target.addEventListener('keyup', this.onKeyup)

    this.addInteractions(interactions)
  }
  // add data / events
  addKeyCodes(newCodes) {
    this.keyboardMap = { ...this.keyboardMap, ...newCodes }
  }
  addInteractions(interactions) {
    interactions.forEach((i) => this.addInteraction(i))
  }
  removeInteractions(interactions) {
    interactions.forEach((i) => this.removeInteraction(i))
  }

  //check data
  isKeyDown(key) {
    return this.downKeys.has(key)
  }
  check(formula, eventType) {
    const node = parseFormula(formula)
    const eventChecker = this.getEventChecker(node, eventType)
    return eventChecker()
  }

  // processing event formulas
  addInteraction({ formula = '', reaction = (e) => e, eventType = 'keyup', target = anyTarget }) {
    const node = parseFormula(formula)
    const eventChecker = this.getEventChecker(node, eventType)
    this.getNodeKeys(node).forEach((k) => {
      this.addEventReaction({
        key: k,
        type: eventType,
        reaction: (e) => {
          eventChecker() && reaction(e)
        },
        formula: formula,
        target,
      })
    })
  }
  removeInteraction({ formula = '', eventType = 'keyup', target = anyTarget }) {
    const node = parseFormula(formula)
    this.getNodeKeys(node).forEach((k) => {
      this.removeEventReaction({
        key: k,
        type: eventType,
        formula: formula,
        target,
      })
    })
  }
  getNodeKeys(node) {
    if (node.konami) {
      let keys = new Set([...this.getNodeKeys(node.konami[node.konami.length - 1])])
      if (keys.has('any')) return new Set(['any'])
      return keys
    } else if (node.combo) {
      let keys = new Set()
      node.combo.forEach((n) => {
        keys = new Set([...keys, ...this.getNodeKeys(n)])
      })
      if (keys.has('any')) return new Set(['any'])
      return keys
    } else if (node.or) {
      let keys = new Set()
      node.or.forEach((n) => {
        keys = new Set([...keys, ...this.getNodeKeys(n)])
      })
      if (keys.has('any')) return new Set(['any'])
      return keys
    } else if (node.not) {
      return new Set(['any'])
    } else if (node.key) {
      const mappedKeys = this.keyboardMap[node.key.toLowerCase()]
      if (mappedKeys) return this.getNodeKeys(parseFormula(mappedKeys))
      return new Set([node.key.toLowerCase()])
    }
  }

  // event checkers
  checkEvent({ key, eventType, target }, e = this.eventHistory[0]) {
    if (!e) return false
    key = e && isNaN(e.keys[0]) ? key.toLowerCase() : this.keyCodeMap[key.toLowerCase()]
    return (
      (key ? e && e.keys && e.keys.includes(key) : true) &&
      (eventType ? e.type === eventType.toLowerCase() : true) &&
      (target ? target === this.getTarget(e) : true)
    )
  }
  checkEventComboKeys({ key, eventType, target }, e = this.eventHistory[0]) {
    if (!e) return false
    key = e && isNaN(e.keys) ? key.toLowerCase() : this.keyCodeMap[key.toLowerCase()]
    return (
      (key ? e && e.keys && e.comboKeys.includes(key) : true) &&
      (eventType ? e.type === eventType.toLowerCase() : true) &&
      (target ? target === this.getTarget(e) : true)
    )
  }
  getEventChecker(node, eventType = 'keyup', length = 1, baseChecker = this.checkEvent) {
    if (node.konami) {
      return this.checkKonamiEvent(node, eventType, length, baseChecker)
    } else if (node.combo) {
      return this.checkComboEvent(node, eventType, length, baseChecker)
    } else if (node.or) {
      return this.checkOrEvent(node, eventType, length, baseChecker)
    } else if (node.not) {
      return this.checkNotEvent(node, eventType, length, baseChecker)
    } else if (node.key) {
      return this.checkKeyEvent(node, eventType, length, baseChecker)
    }
  }
  checkKonamiEvent(node, eventType = 'keyup', length = 1, baseChecker) {
    const reverseKonami = [...node.konami].reverse()
    return (e = this.eventHistory[0]) => {
      let historyIndex = 0
      let sequence = 0
      reverseKonami.forEach((kn, i) => {
        if (sequence !== i) return
        historyIndex = this.getHistoryIndexBefore(
          historyIndex,
          'keyup',
          (index) =>
            !index ||
            (kn.not
              ? this.getEventChecker(kn, 'keyup', length, this.checkEventComboKeys)(this.eventHistory[index])
              : this.getEventChecker(kn, 'keyup', length, this.checkEventComboKeys)(this.eventHistory[index]))
        )
        if (
          this.eventHistory[historyIndex] &&
          this.getEventChecker(kn, !i ? eventType : 'keyup', length, baseChecker)(this.eventHistory[historyIndex])
        ) {
          sequence++
        }
        historyIndex++
      })
      return sequence === reverseKonami.length
    }
  }
  getHistoryIndexBefore(index, eventType, extraConditions) {
    while (
      this.eventHistory[index] &&
      // keep increasing index until conditions are met
      !(
        (eventType ? this.eventHistory[index].type === eventType : true) &&
        (!extraConditions || extraConditions(index))
      )
    ) {
      index++
    }
    return index
  }
  checkComboEvent(node, eventType = 'keyup', length = 1, baseChecker) {
    let kn = node.combo.find((n) => n.konami)
    if (kn) {
      let comboNodes = node.combo.filter((n) => n !== kn)
      kn.konami = kn.konami.map((n) => ({ combo: [n, ...comboNodes] }))
      kn.string = node.string
      return (e = this.eventHistory[0]) => {
        return this.getEventChecker(kn, eventType, length, baseChecker)(e)
      }
    }
    return (e = this.eventHistory[0]) =>
      node.combo.every((n) => this.getEventChecker(n, eventType, node.combo.length, baseChecker)(e))
  }
  checkOrEvent(node, eventType = 'keyup', length = 1, baseChecker) {
    return (e = this.eventHistory[0]) => node.or.some((n) => this.getEventChecker(n, eventType, length, baseChecker)(e))
  }
  checkNotEvent(node, eventType = 'keyup', length = 1, baseChecker) {
    return (e = this.eventHistory[0]) => {
      return !this.getEventChecker(node.not, eventType, length, baseChecker)(e)
    }
  }
  checkKeyEvent(node, eventType = 'keyup', length = 1, baseChecker) {
    const mappedKeys = this.keyboardMap[node.key.toLowerCase()]
    if (mappedKeys) return this.getEventChecker(parseFormula(mappedKeys), eventType, length, baseChecker)
    return (e = this.eventHistory[0]) => {
      if (!e) return false
      return (
        e.keys.length === length &&
        baseChecker(
          {
            key: node.key.toLowerCase(),
            eventType: eventType,
          },
          e
        )
      )
    }
  }

  //on up and down
  onKeydown(e) {
    const eventCode = (e.code && e.code.toLowerCase()) || String(e.keyCode)
    if (!e.repeat || !this.downKeys.has(eventCode)) {
      this.addToHistory(e)
      this.downKeys.add(eventCode)
      this.fireEventReactions(e)
    } else if (
      this.downKeys.has(eventCode) &&
      ['metaleft', 'metaright', '91', '93'].some((k) => this.downKeys.has(k))
    ) {
      const checkForKeyUp = () => {
        if (Date.now() - this.artificialKeyUpTimes[eventCode] > 100) {
          delete this.artificialKeyUpTimes[eventCode]
          this.target.dispatchEvent(new KeyboardEvent('keyup', e))
        } else {
          setTimeout(checkForKeyUp, 100)
        }
      }
      if (!this.artificialKeyUpTimes[eventCode]) setTimeout(checkForKeyUp, 100)
      this.artificialKeyUpTimes[eventCode] = Date.now()
    }
  }

  onKeyup(e) {
    const eventCode = (e.code && e.code.toLowerCase()) || String(e.keyCode)
    this.downKeys.delete(eventCode)
    this.addToHistory(e)
    this.fireEventReactions(e)
  }

  //history and reactinons
  addToHistory(e) {
    const eventCode = (e.code && e.code.toLowerCase()) || String(e.keyCode)
    let keys = [eventCode, ...this.downKeys]
    const prevEvent = this.eventHistory[0]
    this.eventHistory.unshift({
      type: e.type.toLowerCase(),
      keys: keys,
      timestamp: e.timeStamp,
      target: this.getTarget(e),
      comboKeys:
        prevEvent && keys.length !== prevEvent.keys.length && keys.every((k) => prevEvent.keys.includes(k))
          ? prevEvent.comboKeys
          : keys,
    })
    if (this.eventHistory.length > 20) {
      this.eventHistory.pop()
    }
  }
  addEventReaction({ key = 'any', type = 'any', reaction, formula, target = anyTarget }) {
    const t = tuple(key, type, target)
    if (this.eventReactions.get(t) === undefined) this.eventReactions.set(t, {})
    this.eventReactions.get(t)[formula] = reaction
  }
  removeEventReaction({ key = 'any', type = 'any', formula, target = anyTarget }) {
    const t = tuple(key, type, target)
    if (this.eventReactions.get(t) === undefined) delete this.eventReactions.get(t)[formula]
  }
  fireReactions({ key = 'any', type = 'any', target = anyTarget }, event) {
    const t = tuple(key, type, target)
    const reactions = this.eventReactions.get(t)
    reactions &&
      Object.values(reactions).forEach((reaction) => {
        reaction(event)
      })
  }
  fireEventReactions(e) {
    const eventCode = (e.code && e.code.toLowerCase()) || String(e.keyCode)
    this.fireReactions({ key: eventCode, type: e.type, target: this.getTarget(e) }, e)
    this.fireReactions({ key: eventCode, type: e.type }, e)
    this.fireReactions({ type: e.type, target: this.getTarget(e) }, e)
    this.fireReactions({ key: eventCode, target: this.getTarget(e) }, e)
    this.fireReactions({ key: eventCode }, e)
    this.fireReactions({ type: e.type }, e)
    this.fireReactions({ target: this.getTarget(e) }, e)
  }

  // dispose
  dispose() {
    this.target.removeEventListener('keydown', this.onKeydown)
    this.target.removeEventListener('keyup', this.onKeyup)
  }
}
