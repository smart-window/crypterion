import {assign} from 'lodash';
import {handleError, handleSuccess} from "admin/support/utils/promise";


export default class Pagination {
	constructor(api, url, method = 'POST') {
		this.api = api;
		this.url = url;
		this.method = method;
	}

	fetchData(params, filters, onSuccess, onError) {
		const {axios} = this.api;
		params = assign({pageSize : 10, current : 1}, params);

		const request = axios.request({
			url    : this.url,
			method : this.method,
			data   : {
				itemPerPage : params.pageSize,
				page        : params.current,
				filters     : filters
			}
		});

		return request.then(response => handleSuccess(response, onSuccess))
			.catch(error => handleError(error, onError))
	}
}