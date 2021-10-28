import React, {Component} from 'react';

class AsyncError extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	render() {
		return (
			<div>

			</div>
		);
	}
}

export default AsyncError;