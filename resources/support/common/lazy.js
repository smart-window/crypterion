import React, {Component} from "react";
import loadable from "@loadable/component"
import {FormattedMessage} from "react-intl";
import {Result} from "antd";
import Loading from "components/Loading";

function lazy(ImportComponent, routeProps) {
	const LoadedComponent = loadable(ImportComponent, {
		fallback : (
			<Loading/>
		)
	});

	class LazyLoadedComponent extends Component {
		constructor(props) {
			super(props);

			this.state = {
				hasError : false
			};
		}

		static getDerivedStateFromError(error) {
			console.log(error);

			return {hasError : true};
		}

		render() {
			return (
				<React.Fragment>
					{this.state.hasError ?
						<Result status="500"
						        title={
							        <FormattedMessage
								        defaultMessage="Oops! Something went wrong..."
								        id="common.something_went_wrong"/>
						        }
						        subTitle={
							        <FormattedMessage
								        defaultMessage="Please, refresh to try again."
								        id="common.refresh_to_try_again"/>
						        }/> :
						<LoadedComponent {...this.props} {...routeProps}/>
					}
				</React.Fragment>
			);
		}
	}

	return LazyLoadedComponent;
	// return React.forwardRef((props, ref) => {
	// 	return <LazyLoadedComponent {...props} forwardedRef={ref}/>;
	// });
}

export default lazy;
