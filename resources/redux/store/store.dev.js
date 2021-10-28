import createSagaMiddleware, {END} from "redux-saga";
import {applyMiddleware, compose, createStore} from "redux";
import createRootReducers from "../reducers";

const composeEnhancers = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
	window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

function configureStore(initialState) {
	const sagaMiddleware = createSagaMiddleware();

	const store = createStore(
		createRootReducers(),
		initialState,
		composeEnhancers(applyMiddleware(sagaMiddleware))
	);

	store.runSaga = sagaMiddleware.run;
	store.close = () => store.dispatch(END);

	if (module.hot) {
		// Enable Webpack hot module replacement for reducers
		module.hot.accept('../reducers', () => {
			store.replaceReducer(createRootReducers(history));
		});
	}

	return store;
}

export default configureStore;