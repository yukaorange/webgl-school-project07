'use strict';

// Simple implementation of the pub/sub pattern to decouple components
export class EventEmitter {

  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);// add the callback to the event. event is array of callbacks
  }

  remove(event, listener) {
    if (this.events[event]) {
      const index = this.events[event].indexOf(listener);
      if (~index) {
        this.events[event].splice(index, 1);
      }
    }
  }

  emit(event) {
    const events = this.events[event];
    if (events) {
      events.forEach((event) => event());//emitting the event
    }
  }

}