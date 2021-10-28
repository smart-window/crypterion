import moment from "moment";

const defaultDateFormat = 'MMMM Do YYYY, h:mm a';

export function pipe(...arg) {
	return (x) => arg.reduce((v, f) => f(v), x);
}

export function join(delimiter, ...values) {
	return values.join(delimiter);
}

export function currencyFormat(value, currency) {
	const locale = navigator.language;
	return Intl.NumberFormat(locale, {
		style : 'currency', currency : currency
	}).format(value)
}

export function formatDate(date, format) {
	if (!format) format = defaultDateFormat;
	const dateObject = moment(date);
	if (!dateObject.isValid()) return date;
	return dateObject.format(format);
}

export function formatUTCDate(date, format) {
	if (!format) format = defaultDateFormat;
	const dateObject = moment.utc(date);
	if (!dateObject.isValid()) return date;
	return dateObject.local().format(format);
}

export function truncate(value, length = 25, ellipsis = "...") {
	if(typeof value !== "string") return value;

	return value.length <= length ? value :
		value.substring(0, length) + ellipsis;
}

export function dateFromNow(date) {
	const dateObject = moment(date);
	if (!dateObject.isValid()) return date;
	return dateObject.fromNow();
}

export function utcDateFromNow(date) {
	const dateObject = moment.utc(date);
	if (!dateObject.isValid()) return date;
	return dateObject.local().fromNow();
}

export function dateCalendarTime(date) {
	const dateObject = moment(date);
	if (!dateObject.isValid()) return date;
	return dateObject.calendar();
}

export function utcDateCalendarTime(date) {
	const dateObject = moment.utc(date);
	if (!dateObject.isValid()) return date;
	return dateObject.local().calendar();
}

export function sortDate(a, b) {
	return moment(a).diff(moment(b));
}

export function stringToHex(value) {
	let hash = 0, color = '#';

	if (value.length === 0) return '#ccc';
	for (let i = 0; i < value.length; i++) {
		hash = value.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash;
	}

	for (let i = 0; i < 3; i++) {
		let sub = (hash >> (i * 8)) & 255;
		color += ('00' + sub.toString(16)).substr(-2);
	}
	return color;
}