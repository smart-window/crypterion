class TwoFactorSetting {
	constructor(user) {
		this.settings = user.two_factor_setting;
	}

	marketplace() {
		return this.enabled() && this.settings.marketplace;
	}

	outgoingTransfer() {
		return this.enabled() && this.settings.outgoing_transfer;
	}

	authentication() {
		return this.enabled() && this.settings.authentication;
	}

	enabled() {
		return this.settings && this.settings.enabled;
	}
}

export default TwoFactorSetting