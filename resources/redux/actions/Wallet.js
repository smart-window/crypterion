export const SHOW_DEPOSIT_MODAL = 'SHOW_DEPOSIT_MODAL';
export const HIDE_DEPOSIT_MODAL = 'HIDE_DEPOSIT_MODAL';

export function showDepositModal(accountId) {
  return {type: SHOW_DEPOSIT_MODAL, accountId};
}

export function hideDepositModal() {
  return {type: HIDE_DEPOSIT_MODAL};
}

export const SHOW_NEW_ACCOUNT_MODAL = 'SHOW_NEW_ACCOUNT_MODAL';
export const HIDE_NEW_ACCOUNT_MODAL = 'HIDE_NEW_ACCOUNT_MODAL';

export function showNewAccountForm() {
  return {type: SHOW_NEW_ACCOUNT_MODAL};
}

export function hideNewAccountForm() {
  return {type: HIDE_NEW_ACCOUNT_MODAL};
}

export const SHOW_WITHDRAW_MODAL = 'SHOW_WITHDRAW_MODAL';
export const HIDE_WITHDRAW_MODAL = 'HIDE_WITHDRAW_MODAL';

export function showWithdrawModal(accountId) {
  return {type: SHOW_WITHDRAW_MODAL, accountId};
}

export function hideWithdrawModal() {
  return {type: HIDE_WITHDRAW_MODAL};
}

export const SET_ACCOUNTS = 'SET_ACCOUNTS';
export const START_ACCOUNTS_LOADING = 'START_ACCOUNTS_LOADING';
export const STOP_ACCOUNTS_LOADING = 'STOP_ACCOUNTS_LOADING';
export const FETCH_ACCOUNTS = 'FETCH_ACCOUNTS';

export function fetchAccounts() {
  return {type: FETCH_ACCOUNTS};
}

export function setAccounts(account) {
  return {type: SET_ACCOUNTS, payload: account};
}

export function stopAccountsLoading() {
  return {type: STOP_ACCOUNTS_LOADING};
}

export function startAccountsLoading() {
  return {type: START_ACCOUNTS_LOADING};
}




