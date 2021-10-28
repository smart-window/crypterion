import createSagaMiddleware, {END} from "redux-saga";
import {applyMiddleware, createStore} from "redux";
import createRootReducers from "../reducers";

function configureStore(initialState) {
	const sagaMiddleware = createSagaMiddleware();

	const store = createStore(
		createRootReducers(),
		initialState,
		applyMiddleware(sagaMiddleware)
	);

	store.runSaga = sagaMiddleware.run;
	store.close = () => store.dispatch(END);

	return store;
}

export default configureStore;