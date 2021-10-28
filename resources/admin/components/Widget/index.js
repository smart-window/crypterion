import React from "react";
import {Card} from "antd";

const Widget = ({styleName, ...otherProps}) => {
	return (
		<Card bordered={false}
		      className={`cp-card-widget ${styleName}`}
		      {...otherProps}/>
	)
};

Widget.defaultProps = {
	styleName : '',
};

export default Widget;
