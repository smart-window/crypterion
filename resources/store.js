import configureStore from "./redux/store";
import {assign} from 'lodash'
import {initAuth} from "redux/reducers/Auth";
import {initSettings} from 'redux/reducers/Settings';
import context from "context";

const {settings, auth} = context;

const store = configureStore({
	auth     : assign(initAuth, auth),
	settings : assign(initSettings, settings)
});

export default store;