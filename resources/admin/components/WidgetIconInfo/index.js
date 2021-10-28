import React from 'react';
import Widget from "../Widget";

const WidgetIconInfo = ({styleName, title, subTitle, iconClassName}) => {
	return (
		<Widget styleName={`cp-card-full p-3 ${styleName}`}>
			<div className="cp-media align-items-center flex-nowrap">
				<div className="mr-3">
					<i className={`${iconClassName} fs-3x`}/>
				</div>
				<div className="cp-media-body">
					<h1 className="fs-xl font-weight-semi-bold mb-2">
						{title}
					</h1>
					<p className="mb-0">
						{subTitle}
					</p>
				</div>
			</div>
		</Widget>
	);
};

export default WidgetIconInfo;