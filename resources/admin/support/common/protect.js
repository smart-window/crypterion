import React, {Component} from "react";
import Auth from "admin/support/Auth";
import {connect} from "react-redux";

function protect(WrappedComponent, fallback) {
	class ProtectedHelper extends Component {
		shouldShow() {
			const {
				auth, can, cannot,
				hasRole, hasAllRole, hasAnyRole,
				fallbackCondition
			} = this.props;

			let show = auth.check();

			if (hasRole) {
				show = show && auth.hasRole(hasRole)
			} else if (hasAnyRole) {
				show = show && auth.hasAnyRole(hasAnyRole)
			} else if (hasAllRole) {
				show = show && auth.hasAllRole(hasAllRole)
			}

			if (can) {
				show = show && auth.can(can)
			} else if (cannot) {
				show = show && auth.cannot(cannot)
			}

			if (fallbackCondition) {
				show = show || fallbackCondition
			}

			return show;
		}

		render() {
			const {
				auth, dispatch,
				hasRole, hasAllRole, hasAnyRole,
				can, cannot, ...otherProps
			} = this.props;

			if (!this.shouldShow()) {
				return fallback ? fallback : null;
			}

			return (
				<WrappedComponent
					ref={this.props.forwardedRef}
					{...otherProps}/>
			);
		}
	}

	const ProtectedComponent = React.forwardRef((props, ref) => {
		return <ProtectedHelper {...props} forwardedRef={ref}/>;
	});

	const mapStateToProps = ({
		auth
	}) => ({
		auth : new Auth(auth)
	});

	return connect(
		mapStateToProps
	)(ProtectedComponent);
}

export default protect