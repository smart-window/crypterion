import axios from 'axios';
import context from "context"
import {handleUploadError, handleUploadSuccess} from "support/utils/promise";
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

export function uploadRequest(obj) {
	const formData = new FormData();

	if (typeof obj.data === "object") {
		for (let i in obj.data) {
			if (obj.data.hasOwnProperty(i)) formData.append(i, obj.data[i]);
		}
	}

	formData.set(obj.filename, obj.file);

	axios.post(obj.action, formData, {
		headers : {
			'Content-Type' : 'multipart/form-data'
		}
	})
		.then(response => handleUploadSuccess(response, (data) => {
			const {onSuccess} = obj;
			if (typeof onSuccess === "function") {
				onSuccess(data);
			}
		}))
		.catch(error => handleUploadError(error, (errors, message) => {
			const {onError} = obj;
			if (typeof onError === "function") {
				onError(errors, message);
			}
		}))
}

export {axios, route, csrfToken};
export default ApiService;
