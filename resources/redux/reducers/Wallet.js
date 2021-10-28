import * as Actions from "redux/actions/Wallet";

export const initWallet = {
	// Accounts List
	accountsLoading     : false,
	accounts            : [],
	// Withdrawal Modal
	visibleWithdrawModal   : false,
	withdrawAccountId   : undefined,
	// New Account Modal
	showNewAccountModal : false,
	// Deposit Modal
	visibleDepositModal    : false,
	depositAccountId    : undefined,
};

const wallet = (state = initWallet, action) => {
	switch (action.type) {
		case Actions.SET_ACCOUNTS:
			return {
				...state,
				accounts : action.payload
			};

		case Actions.START_ACCOUNTS_LOADING:
			return {
				...state,
				accountsLoading : true
			};

		case Actions.STOP_ACCOUNTS_LOADING:
			return {
				...state,
				accountsLoading : false
			};

		case Actions.SHOW_NEW_ACCOUNT_MODAL:
			return {
				...state,
				showNewAccountModal : true
			};

		case Actions.HIDE_NEW_ACCOUNT_MODAL:
			return {
				...state,
				showNewAccountModal : false
			};

		case Actions.SHOW_WITHDRAW_MODAL:
			return {
				...state,
				visibleWithdrawModal : true,
				withdrawAccountId : action.accountId
			};

		case Actions.HIDE_WITHDRAW_MODAL:
			return {
				...state,
				visibleWithdrawModal : false
			};


		case Actions.SHOW_DEPOSIT_MODAL:
			return {
				...state,
				visibleDepositModal : true,
				depositAccountId : action.accountId
			};

		case Actions.HIDE_DEPOSIT_MODAL:
			return {
				...state,
				visibleDepositModal : false
			};

		default:
			return state;
	}
};

export default wallet;
