'use strict'
import { EventEmitter } from './EventEmitter.js'

// Abstracts away the requestAnimationFrame in an effort to provie a clock instance
// to sync various parts of an application
export class Clock extends EventEmitter {
  constructor() {
    super()
    this.isRunning = true

    this.tick = this.tick.bind(this)
    this.tick() // when instance is created, start the clock

    this.startTime = Date.now()

    // window.onblur = () => {
    //   // when chage to another tab, stop the clock
    //   this.stop()
    //   console.info('Clock stopped')
    // }

    // window.onfocus = () => {
    //   // when come back to the tab, resume the clock
    //   this.start()
    //   console.info('Clock resumed')
    // }
  }

  // Gets called on every requestAnimationFrame cycle
  tick() {
    if (this.isRunning) {
      this.emit('tick') // emitter is emitting this.tick
    }
    requestAnimationFrame(this.tick) //roop
  }

  // Starts the clock
  start() {
    this.isRunning = true
  }

  // Stops the clock
  stop() {
    this.isRunning = false
  }

  getElapsedTime() {
    return Date.now() - this.startTime
  }
}
