import Echo from "./Echo";
import {forEach, forOwn, keys} from "lodash";

class Broadcast {
	constructor() {
		this.listeners = {};
		this.whisperListeners = {};
		this.channel = null;
	}

	instance() {
		return this.channel;
	}

	listen(event, callback) {
		this.unbindListeners();
		this.listeners[event] = callback;
		this.bindListeners();
	}

	listenForWhisper(event, callback) {
		this.unbindWhisperListeners();
		this.whisperListeners[event] = callback;
		this.bindWhisperListeners();
	}

	stopListening(event) {
		this.unbind();
		delete this.whisperListeners[event];
		delete this.listeners[event];
		this.bind();
	}

	setChannel(channel) {
		if (typeof channel === "string" && Echo.connector) {
			this.unbind();
			this.channel = Echo.channel(channel);
			this.bind();
		}
	}

	/**
	 * Bind Listeners
	 */

	bind() {
		this.bindListeners();
		this.bindWhisperListeners();
	}

	bindListeners() {
		if (this.channel) {
			forOwn(this.listeners, (callback, event) => {
				this.channel.listen(event, callback);
			});
		}
	}

	bindWhisperListeners() {
		if (this.channel) {
			forOwn(this.whisperListeners, (callback, event) => {
				this.channel.listenForWhisper(event, callback);
			});
		}
	}

	/**
	 * Unbind listeners
	 */

	unbind() {
		this.unbindListeners();
		this.unbindWhisperListeners();
	}

	unbindListeners() {
		if (this.channel) {
			const events = keys(this.listeners);

			forEach(events, (event) => {
				this.channel.stopListening(event);
			});
		}
	}

	unbindWhisperListeners() {
		if (this.channel) {
			const events = keys(this.whisperListeners);

			forEach(events, (event) => {
				this.channel.stopListening(event);
			});
		}
	}
}

export default Broadcast