import React, {forwardRef, useEffect} from 'react';
import * as ThemeSettings from "constants/ThemeSettings";
import ReCAPTCHA from "react-google-recaptcha";
import {isEmpty} from "lodash";


const ReCaptcha = (props, ref) => {
	const {settings, errors} = props;
	const recaptcha = React.createRef();

	useEffect(() => {
		if (settings.enable && !isEmpty(errors)) {
			recaptcha.current.reset();
		}
	});

	return (
		<div ref={ref} className="center-recaptcha">
			{settings.enable && (
				<ReCAPTCHA
					onChange={props.onChange}
					sitekey={settings.sitekey}
					ref={recaptcha}
					theme={ThemeSettings.THEME_TYPE_LITE ? 'light' : 'dark'}
					size={settings.type}/>
			)}
		</div>
	);

};

export default forwardRef(ReCaptcha);