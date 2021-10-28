import React from 'react';
import {lowerCase} from "lodash";

const Flag = ({code}) => {
	return (
		<span className={`flag-icon mr-2 flag-icon-${lowerCase(code)}`}/>
	);
};

export default Flag;