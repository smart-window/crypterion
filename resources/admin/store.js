import configureStore from "admin/redux/store";
import {assign} from 'lodash'
import {initAuth} from "admin/redux/reducers/Auth";
import {initSettings} from 'admin/redux/reducers/Settings';
import context from "admin/context";

const {settings, auth} = context;

const store = configureStore({
	auth     : assign(initAuth, auth),
	settings : assign(initSettings, settings)
});

export default store;