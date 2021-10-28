import Api from "../Services/Api";
import {message as messageApi} from "antd";
import {isEmpty} from "lodash";
import {setAuthUser} from "admin/redux/actions/Auth";
import store from "store";

export function handleUploadError(error, callback) {
	if (!Api.isCancel(error)) {
		const {response} = error;

		if (response) {
			if(response.data){
				const {errors, message} = response.data;

				if (typeof callback === "function") {
					callback(errors, message)
				}
			}

		} else {
			if (typeof callback === "function") {
				callback()
			}
		}
	} else {
		if (error.message) {
			console.log(error.message)
		}
	}
}

export function handleUploadSuccess(response, callback, message) {
	if (typeof callback === "function") {
		callback(response.data);
	}

	if (typeof message === "string") {
		messageApi.success(message);
	}
}

export function handleError(error, callback, cancelled) {
	if (!Api.isCancel(error)) {
		const {response} = error;

		if (response) {
			if(response.data){
				const {message} = response.data;

				if (message) {
					messageApi.error(message);
				}
			}

			if(response.status === 401){
				store.dispatch(setAuthUser({}))
			}
		}

		if (typeof callback === "function") {
			callback();
		}
	} else {
		if (error.message) {
			console.log(error.message)
		}

		if (typeof cancelled === "function") {
			cancelled();
		}
	}
}

export function handleSuccess(response, callback, message) {
	if (typeof callback === "function") {
		callback(response.data);
	}

	if (typeof message === "string") {
		messageApi.success(message);
	}
}

export function handleFormError(error, form, values, callback, cancelled) {
	if (!Api.isCancel(error)) {
		const {response} = error;

		if (response && response.data) {
			const {errors, message} = response.data;

			if (!isEmpty(errors) && !isEmpty(values)) {
				let fields = {}, field;

				for (field in errors) {
					if (errors.hasOwnProperty(field)) {
						fields[field] = {
							value  : values[field],
							errors : errors[field].map(
								message => new Error(message)
							)
						};
					}
				}

				form.setFields(fields);
			} else if (message) {
				messageApi.error(message);
			}
		}

		if (typeof callback === "function") {
			callback()
		}
	} else {
		if (error.message) {
			console.log(error.message)
		}

		if (typeof cancelled === "function") {
			cancelled();
		}
	}
}

export function handleFormSuccess(response, form, callback, message) {
	if (typeof callback === "function") {
		callback(response.data);
	}

	if (typeof message === "string") {
		messageApi.success(message);
	}
}