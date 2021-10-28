import echarts from 'echarts/lib/echarts';
import Echarts from 'components/Echarts';
import React, {Component} from 'react';
import {connect} from "react-redux";
import {assign} from 'lodash';
import {THEME_TYPE_LITE} from "constants/ThemeSettings";
import dark from './themes/dark';
import light from './themes/light';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/legendScroll';
import 'echarts/lib/component/tooltip';

echarts.registerTheme('darkTheme', dark);
echarts.registerTheme('lightTheme', light);

const defaultOption = {};

class Charts extends Component {
	constructor(props) {
		super(props)
	}

	isLiteTheme() {
		return this.props.themeType === THEME_TYPE_LITE
	}

	render() {
		const {themeType, option, ...otherProps} = this.props;
		const newOption = assign(defaultOption, option);

		return (
			<Echarts {...otherProps}
			         option={newOption}
			         theme={this.isLiteTheme() ? "lightTheme" : "darkTheme"}
			         echarts={echarts}/>
		);
	}
}

const mapStateToProps = ({
	settings : {
		themeType
	}
}) => ({
	themeType
});

export default connect(
	mapStateToProps
)(Charts)