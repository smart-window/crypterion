import React from 'react';
import {Icon, Spin} from "antd";

const Loading = () => {
	return (
		<div className="text-center my-5 w-100">
			<Spin size="large"
			      indicator={
				      <Icon type="loading" style={{fontSize : 24}} spin/>
			      }/>
		</div>
	);
};

export default Loading;