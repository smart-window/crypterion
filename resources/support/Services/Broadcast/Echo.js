import context from "context"
import Echo from "laravel-echo/dist/echo";

let config = {};

const {driver, connection} = context.broadcast;

if (typeof window === "object") {
	if (driver === "pusher") {
		config = {
			broadcaster : 'pusher',
			cluster     : connection.options.cluster,
			forceTLS    : connection.options.useTLS,
			key         : connection.key,
		};
	}

	if (driver === "redis") {
		const host = window.location.hostname;

		config = {
			broadcaster : 'socket.io',
			host        : host + ':6001'
		};
	}
}

export default new Echo(config);