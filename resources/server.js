import React from "react";
import Bootstrap from "./bootstrap";
import {Provider} from "react-redux";
import {StaticRouter} from "react-router-dom";
import ReactDOMServer from 'react-dom/server';
import store from "store";

let routerContext = {};

const html = ReactDOMServer.renderToString(
	<Provider store={store}>
		<StaticRouter location={context.url}
		              context={routerContext}>
			<Bootstrap/>
		</StaticRouter>
	</Provider>
);

if (!routerContext.url) {
	dispatch(html);
} else {
	const {url, status} = routerContext;

	dispatch({
		redirect : {
			status : status ? status : 302,
			url    : url,
		}
	})
}

