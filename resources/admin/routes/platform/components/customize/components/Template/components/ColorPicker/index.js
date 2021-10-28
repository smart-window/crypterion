import React, {Component} from 'react';
import {Popover, Tooltip} from "antd";
import {Panel} from 'rc-color-picker';
import {startCase} from "lodash";

class ColorPicker extends Component {
	onChange = ({color}) => {
		clearTimeout(this.colorChanged);

		const {onChange} = this.props;

		this.colorChanged = setTimeout(() => {
			if (onChange) onChange(color)
		}, 500);
	};

	render() {
		const {color, name} = this.props;
		return (
			<div className="d-inline-block">
				<div className="d-flex mb-2 mr-3 align-items-center">
					<Tooltip title={startCase(name)}
					         placement="top">
						<Popover trigger="click"
						         overlayClassName="full-content"
						         placement="bottom"
						         content={
							         <Panel enableAlpha={false}
							                onChange={this.onChange}
							                defaultColor={color}/>
						         }>
							<span style={{
								display      : 'inline-block',
								width        : '30px',
								height       : '30px',
								borderRadius : '50%',
								padding      : '2px',
								boxShadow    : '0 0 0 1px rgba(0,0,0,.1)',
								background   : color,
								cursor       : "pointer",
							}}/>
						</Popover>
					</Tooltip>
				</div>
			</div>
		);
	}
}

export default ColorPicker;