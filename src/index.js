import { parseFormula } from './parser/parseFormula'
import US from './keyboardMap/US'
import keyCodeMap from './keyboardMap/keyCodeMap'

export default class HyperInteractive {
  constructor(target, interactions = [], keyboardMap = US, codeMap = keyCodeMap) {
    this.target = target
    this.keyboardMap = keyboardMap
    this.keyCodeMap = codeMap
    this.downKeys = new Set()
    this.keyDownEvents = []
    this.keyUpEvents = []
    this.sequences = {}
    this.combos = {}
    this.keyDownTimestamp = 0
    this.keyUpTimestamp = 0
    this.prevKeyDownTimestamp = 0
    this.prevKeyUpTimestamp = 0
    this.numKeyDownEvents = 0
    this.numKeyUpEvents = 0
    this.onKeydown = this.onKeydown.bind(this)
    this.onKeyup = this.onKeyup.bind(this)
    this.isKeyDown = this.isKeyDown.bind(this)
    this.addInteractions = this.addInteractions.bind(this)
    this.addInteraction = this.addInteraction.bind(this)
    this.processFormulaNode = this.processFormulaNode.bind(this)
    this.addKeyDownEvent = this.addKeyDownEvent.bind(this)
    this.addKeyUpEvent = this.addKeyUpEvent.bind(this)
    this.dispose = this.dispose.bind(this)
    this.target.addEventListener('keydown', this.onKeydown)
    this.target.addEventListener('keyup', this.onKeyup)
    this.addInteractions(interactions)
  }
  addKeyCodes(newCodes) {
    this.keyboardMap = { ...this.keyboardMap, ...newCodes }
  }
  onKeydown(e) {
    const eventCode = e.code?.toLowerCase() || String(e.keyCode)
    if (!e.repeat || !this.downKeys.has(eventCode)) {
      this.keyDownTimestamp = e.timeStamp
      this.numKeyDownEvents++
      this.downKeys.add(eventCode)
      this.keyDownEvents.forEach(keyEvent => keyEvent(e))
      this.prevKeyDownTimestamp = e.timeStamp
    }
  }
  onKeyup(e) {
    const eventCode = e.code?.toLowerCase() || String(e.keyCode)
    this.keyUpTimestamp = e.timeStamp
    this.numKeyUpEvents++
    this.keyUpEvents.forEach(keyEvent => keyEvent(e))
    this.downKeys.delete(eventCode)
    this.prevKeyUpTimestamp = e.timeStamp
  }
  isKeyDown(key) {
    return this.downKeys.has(key)
  }
  addInteractions(interactions) {
    interactions.forEach(i => this.addInteraction(i))
  }
  addInteraction({ formula, reaction, eventType }) {
    const formulaNode = parseFormula(formula)
    this.processFormulaNode({
      id: formula,
      node: formulaNode,
      reactionFunc: reaction,
      eventType,
    })
  }
  processFormulaNode(props) {
    let {
      id,
      level = 0,
      node,
      reactionFunc = e => {
        return
      },
      eventType = 'keyup',
      invert = false,
    } = props
    if (node.konami) {
      const sequenceLength = node.konami.length
      this.sequences[id + level] = {
        step: 0,
        prevTimestamp: 0,
        prevKeyUpNum: 0,
        prevDownKeys: new Set(),
      }
      const sequences = this.sequences[id + level]
      node.konami.forEach((kn, i) => {
        this.processFormulaNode({
          ...props,
          level: level + 1,
          node: kn,
          reactionFunc: e => {
            const eventCode = e.code?.toLowerCase() || String(e.keyCode)
            if (
              sequences.step === i &&
              (i === 0 ||
                // with this technique "or" values need to be the same length
                (this.numKeyUpEvents - sequences.prevKeyUpNum <= node.konami[i - 1].maxKeys &&
                  e.timeStamp !== sequences.prevTimestamp))
            ) {
              if (i === 0) sequences.step = 0
              sequences.step++
              sequences.prevTimestamp = e.timeStamp
              sequences.prevKeyUpNum = this.numKeyUpEvents
              sequences.prevDownKeys = new Set(this.downKeys)
              if (sequences.step === sequenceLength) {
                reactionFunc(e)
                sequences.step = 0
              }
            } else if (
              sequences.step === i &&
              e.timeStamp !== sequences.prevTimestamp &&
              !sequences.prevDownKeys.has(eventCode)
            ) {
              sequences.step = 0
            } else if (sequences.prevDownKeys.has(eventCode)) {
              sequences.prevTimestamp = e.timeStamp
              sequences.prevDownKeys.delete(eventCode)
            }
          },
          eventType: 'keyup',
        })
      })
    } else if (node.combo) {
      this.combos[id + level] = []
      let combos = this.combos[id + level]
      let comboStrings = new Set()
      node.combo.forEach((cn, i) => {
        // make sure you ant press both keys at once
        if (comboStrings.has(cn.string)) return
        comboStrings.add(cn.string)

        combos[i] = false
        if (!cn.konami) {
          this.processFormulaNode({
            ...props,
            level: level + 1,
            node: cn,
            reactionFunc: e => {
              combos[i] = true
              if (eventType === 'keydown' && combos.every(e => e)) {
                reactionFunc(e)
              }
            },
            eventType: 'keydown',
          })
        }
        this.processFormulaNode({
          ...props,
          level: level + 1,
          node: cn,
          reactionFunc: e => {
            if (cn.konami) {
              combos[i] = true
            }
            if (eventType === 'keyup' && combos.every(e => e)) {
              reactionFunc(e)
            }
            combos[i] = false
          },
          eventType: 'keyup',
        })
      })
    } else if (node.or) {
      let orStrings = new Set()
      node.or.forEach((on, i) => {
        // make sure no duplicates or double events fire
        if (orStrings.has(on.string)) return
        orStrings.add(on.string)

        this.processFormulaNode({
          ...props,
          level: level + 1,
          node: on,
        })
      })
    } else if (node.not) {
      this.processFormulaNode({
        ...props,
        level: level + 1,
        node: node.not,
        invert: !invert,
      })
    } else if (node.key) {
      if (this.keyboardMap[node.key.toLowerCase()]) {
        this.processFormulaNode({
          ...props,
          node: parseFormula(this.keyboardMap[node.key.toLowerCase()]),
        })
      } else {
        const fireEvent = e => {
          const interactionCode = e.code ? node.key.toLowerCase() : this.keyCodeMap[node.key.toLowerCase()]
          const eventCode = e.code?.toLowerCase() || String(e.keyCode)
          const matchingKey = node.key.toLowerCase() === 'any' ? true : eventCode === interactionCode
          if (invert ? !matchingKey : matchingKey) {
            reactionFunc(e)
          }
        }
        if (eventType === 'keydown') {
          this.addKeyDownEvent(fireEvent)
        } else if (eventType === 'keyup') {
          this.addKeyUpEvent(fireEvent)
        }
      }
    }
  }
  addKeyDownEvent(event) {
    this.keyDownEvents.push(event)
  }
  addKeyUpEvent(event) {
    this.keyUpEvents.push(event)
  }
  dispose() {
    this.target.removeEventListener('keydown', this.onKeydown)
    this.target.removeEventListener('keyup', this.onKeyup)
  }
}
