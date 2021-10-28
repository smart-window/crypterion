import Echo from "./Echo";
import PrivateBroadcast from "./Private"

class PresenceBroadcast extends PrivateBroadcast{
	constructor() {
		super()
	}

	setChannel(channel) {
		if (typeof channel === "string" && Echo.connector) {
			this.unbind();
			this.channel = Echo.join(channel);
			this.bind();
		}
	}

	// TODO: implement presence broadcast methods
}

export default PresenceBroadcast