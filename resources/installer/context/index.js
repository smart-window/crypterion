if (typeof window !== "undefined") {
	module.exports = window.__APP__;
} else {
	module.exports = context.app;
}
