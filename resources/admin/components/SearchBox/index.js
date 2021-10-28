import React from "react";

const SearchBox = ({className, value, onChange, placeholder}) => (
	<React.Fragment>
		<div className={`cp-search-bar ${className}`}>
			<div className="cp-form-group">
				<input className="ant-input"
				       type="search" onChange={onChange}
				       placeholder={placeholder}
				       value={value}/>
				<span className="cp-search-icon cp-pointer">
					<i className="la la-search"/>
				</span>
			</div>
		</div>
	</React.Fragment>
);

export default SearchBox;

