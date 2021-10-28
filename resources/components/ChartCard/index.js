import React from 'react';
import Widget from "components/Widget";

const ChartCard= ({value, title, children, styleName, icon}) => {
	return (
		<Widget styleName={`cp-card-full ${styleName}`}>
			<div className="cp-actchart px-3 pt-3 mb-2">
				<div className="ant-row-flex">
					<h2 className="mb-0 fs-xxl font-weight-medium">
						{value}
					</h2>
					<span className="fs-xl ml-auto fs-2x">
						{icon}
					</span>
				</div>
				<p className="mb-0 fs-sm cp-text-grey">
					{title}
				</p>
			</div>
			{children}
		</Widget>
	);
};

export default ChartCard;