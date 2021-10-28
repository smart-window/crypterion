import {combineReducers} from "redux";
import Settings from "./Settings";


export const getReducers = () => ({
	settings    : Settings,
});

export default () => {
	const reducers = getReducers();
	return combineReducers(reducers);
}


