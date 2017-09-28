'use strict';

var Actor = require('./actor.js');
var InMemoryActor = require('./in-memory-actor.js');
var Threads = require('webworker-threads');
var P = require('bluebird');

var Worker = Threads.Worker;

/**
 * Actor that is run in a separate thread within the same process.
 */
class ThreadedActor extends Actor {
  constructor(system, parent, definition, id, name, customParameters, creationMessage) {
    super(system, parent, definition, id, name, customParameters);

    this.creationMessage = creationMessage;
  }

  initialize() {
    return new P((resolve, reject) => {
      this.worker = new Worker('threaded-actor-worker.js');
      this.worker.addEventListener('message', event => {
        var msg = event.body;

        this.getLog().debug('Received "create-actor" message response:', msg);

        if (msg.error)
          return reject(new Error(msg.error));

        if (msg.type != 'actor-created' || !msg.body || !msg.body.id)
          return reject(new Error('Unexpected response for "create-actor" message.'));

        resolve();
      });
      this.worker.postMessage(this.creationMessage);
    });
  }

  destroy() {
    this.worker.terminate();
  }

  sendAndReceive0(topic, ...message) {
    // TODO
  }
}

module.exports = ThreadedActor;