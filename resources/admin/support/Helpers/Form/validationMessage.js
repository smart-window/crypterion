import {defineMessages} from "react-intl";

export function validateMessages(intl) {
	return {
		default: intl.formatMessage(messages['default']),
		required: intl.formatMessage(messages['required']),
		enum: intl.formatMessage(messages['enum']),
		whitespace: intl.formatMessage(messages['whitespace']),
		date: {
			format: intl.formatMessage(messages['date.format']),
			parse: intl.formatMessage(messages['date.parse']),
			invalid: intl.formatMessage(messages['date.invalid']),
		},
		types: {
			string: intl.formatMessage(messages['types.string']),
			method: intl.formatMessage(messages['types.method']),
			array: intl.formatMessage(messages['types.array']),
			object: intl.formatMessage(messages['types.object']),
			number: intl.formatMessage(messages['types.number']),
			date: intl.formatMessage(messages['types.date']),
			boolean: intl.formatMessage(messages['types.boolean']),
			integer: intl.formatMessage(messages['types.integer']),
			float: intl.formatMessage(messages['types.float']),
			regexp: intl.formatMessage(messages['types.regexp']),
			email: intl.formatMessage(messages['types.email']),
			url: intl.formatMessage(messages['types.url']),
			hex: intl.formatMessage(messages['types.hex']),
		},
		string: {
			len: intl.formatMessage(messages['string.len']),
			min: intl.formatMessage(messages['string.min']),
			max: intl.formatMessage(messages['string.max']),
			range: intl.formatMessage(messages['string.range']),
		},
		number: {
			len: intl.formatMessage(messages['number.len']),
			min: intl.formatMessage(messages['number.min']),
			max: intl.formatMessage(messages['number.max']),
			range: intl.formatMessage(messages['number.range']),
		},
		array: {
			len: intl.formatMessage(messages['array.len']),
			min: intl.formatMessage(messages['array.min']),
			max: intl.formatMessage(messages['array.max']),
			range: intl.formatMessage(messages['array.range']),
		},
		pattern: {
			mismatch: intl.formatMessage(messages['pattern.mismatch']),
		},
		clone() {
			const cloned = JSON.parse(JSON.stringify(this));
			cloned.clone = this.clone;
			return cloned;
		},
	};
}

const messages = defineMessages({
	'default': {
		id: "form.validation.default",
		defaultMessage: "Validation error on field %s"
	},
	'required': {
		id: "form.validation.required",
		defaultMessage: "%s is required"
	},
	'enum': {
		id: "form.validation.enum",
		defaultMessage: "%s must be one of %s"
	},
	'whitespace': {
		id: "form.validation.whitespace",
		defaultMessage: "%s cannot be empty"
	},
	'date.format': {
		id: "form.validation.date.format",
		defaultMessage: "%s date %s is invalid for format %s"
	},
	'date.parse': {
		id: "form.validation.date.parse",
		defaultMessage: "%s date could not be parsed, %s is invalid"
	},
	'date.invalid': {
		id: "form.validation.date.invalid",
		defaultMessage: "%s date %s is invalid"
	},
	'types.string': {
		id: "form.validation.types.string",
		defaultMessage: "%s is not a %s"
	},
	'types.method': {
		id: "form.validation.types.method",
		defaultMessage: "%s is not a %s (function)"
	},
	'types.array': {
		id: "form.validation.types.array",
		defaultMessage: "%s is not an %s"
	},
	'types.object': {
		id: "form.validation.types.object",
		defaultMessage: "%s is not a %s"
	},
	'types.number': {
		id: "form.validation.types.number",
		defaultMessage: "%s is not a %s"
	},
	'types.date': {
		id: "form.validation.types.date",
		defaultMessage: "%s is not a %s"
	},
	'types.boolean': {
		id: "form.validation.types.boolean",
		defaultMessage: "%s is not a %s"
	},
	'types.integer': {
		id: "form.validation.types.integer",
		defaultMessage: "%s is not an %s"
	},
	'types.float': {
		id: "form.validation.types.float",
		defaultMessage: "%s is not a %s"
	},
	'types.regexp': {
		id: "form.validation.types.regexp",
		defaultMessage: "%s is not a valid %s"
	},
	'types.email': {
		id: "form.validation.types.email",
		defaultMessage: "%s is not a valid %s"
	},
	'types.url': {
		id: "form.validation.types.url",
		defaultMessage: "%s is not a valid %s"
	},
	'types.hex': {
		id: "form.validation.types.hex",
		defaultMessage: "%s is not a valid %s"
	},
	'string.len': {
		id: "form.validation.string.len",
		defaultMessage: "%s must be exactly %s characters"
	},
	'string.min': {
		id: "form.validation.string.min",
		defaultMessage: "%s must be at least %s characters"
	},
	'string.max': {
		id: "form.validation.string.max",
		defaultMessage: "%s cannot be longer than %s characters"
	},
	'string.range': {
		id: "form.validation.string.range",
		defaultMessage: "%s must be between %s and %s characters"
	},
	'number.len': {
		id: "form.validation.number.len",
		defaultMessage: "%s must equal %s"
	},
	'number.min': {
		id: "form.validation.number.min",
		defaultMessage: "%s cannot be less than %s"
	},
	'number.max': {
		id: "form.validation.number.max",
		defaultMessage: "%s cannot be greater than %s"
	},
	'number.range': {
		id: "form.validation.number.range",
		defaultMessage: "%s must be between %s and %s"
	},
	'array.len': {
		id: "form.validation.array.len",
		defaultMessage: "%s must be exactly %s in length"
	},
	'array.min': {
		id: "form.validation.array.min",
		defaultMessage: "%s cannot be less than %s in length"
	},
	'array.max': {
		id: "form.validation.array.max",
		defaultMessage: "%s cannot be greater than %s in length"
	},
	'array.range': {
		id: "form.validation.array.range",
		defaultMessage: "%s must be between %s and %s in length"
	},

	'pattern.mismatch': {
		id: "form.validation.pattern.mismatch",
		defaultMessage: "%s value %s does not match pattern %s"
	}
});