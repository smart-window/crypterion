import React from "react";
import {THEME_TYPE_DARK} from "constants/ThemeSettings";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import context from "context";

const Logo = ({type, theme, themeType}) => (
	<React.Fragment>
		<Link to="/" className={`d-flex d-lg-none cp-header-logo-icon`}>
			<img alt={context.name} src={context.logoIconUrl || require("assets/images/logo-icon.png")}/>
		</Link>

		{type === "lg" &&
		<Link to="/" className="d-none d-lg-block cp-header-logo cp-logo">
			{theme !== 'light' || themeType === THEME_TYPE_DARK ?
				<img alt={context.name} src={context.logoUrl || require("assets/images/logo.png")}/> :
				<img alt={context.name} src={context.logoDarkUrl || require("assets/images/logo-dark.png")}/>
			}
		</Link>
		}
	</React.Fragment>
);

Logo.defaultProps = {
	type : 'sm',
};

const mapStateToProps = ({
	settings : {
		themeType
	}
}) => ({
	themeType
});

export default connect(
	mapStateToProps
)(Logo)