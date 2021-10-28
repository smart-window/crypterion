import Echo from "./Echo";
import Broadcast from "./index"

class PrivateBroadcast extends Broadcast {
	constructor() {
		super()
	}

	setChannel(channel) {
		if (typeof channel === "string" && Echo.connector) {
			this.unbind();
			this.channel = Echo.private(channel);
			this.bind();
		}
	}
}

export default PrivateBroadcast