import configureStore from "installer/redux/store";
import {assign} from 'lodash'
import {initSettings} from 'installer/redux/reducers/Settings';
import context from "installer/context";

const {settings} = context;

const store = configureStore({
	settings : assign(initSettings, settings)
});

export default store;