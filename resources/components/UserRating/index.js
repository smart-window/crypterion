import React, {Component} from 'react';
import {Icon, Rate} from "antd";

class UserRating extends Component {
	render() {
		return (
			<Rate disabled={true}
			      character={
			      	<Icon type="star"
			              style={{fontSize: '15px'}}
			              theme="filled"/>
			      }
			      allowHalf={true}
			      {...this.props}/>
		);
	}
}

export default UserRating;