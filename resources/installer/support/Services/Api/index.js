import axios from 'axios';
import context from "installer/context"
import route from './route';
import {message} from "antd";

const csrfToken = context.csrfToken;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

class ApiService {
	constructor() {
		this.source = axios.CancelToken.source();
		this.route = route;
		this.axios = axios.create({
			cancelToken : this.source.token
		});
		this.message = message;
	}

	cancel(message) {
		this.source.cancel(message);
	}

	static isCancel(value) {
		return axios.isCancel(value)
	}
}

export {axios, route, csrfToken};
export default ApiService;
