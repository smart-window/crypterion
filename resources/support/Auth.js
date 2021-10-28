import {difference, intersection, isEmpty} from 'lodash'
import TwoFactorSetting from "./TwoFactorSetting";

export default class {
	constructor(auth) {
		this.auth = auth;
	}

	/**
	 * Check if user is authenticated
	 */
	check() {
		return !isEmpty(this.auth.user)
	}

	verifiedEmail() {
		return this.check() && this.auth.user.email_verified_at
	}

	verifiedPhone() {
		return this.check() && this.auth.user.phone_verified_at
	}

	/**
	 * Get user object model
	 */
	get user() {
		return this.auth.user;
	}

	twoFactorSetting() {
		return new TwoFactorSetting(this.auth.user);
	}

	/**
	 * Get super admin role
	 */
	isSuperAdmin() {
		if (!this.check()) return false;
		const {superAdminRole} = this.auth;
		const roles = this.user.all_roles;
		return roles.includes(superAdminRole);
	}

	/**
	 * Check if user has role
	 */
	hasRole(value) {
		if (!this.check()) return false;
		const roles = this.user.all_roles;
		return roles.includes(value.trim());
	}

	/**
	 * Check if user has any role
	 */
	hasAnyRole(value) {
		if (!this.check()) return false;
		const roles = this.user.all_roles;
		return intersection(roles, value).length > 0;
	}

	/**
	 * Check if user has all role
	 */
	hasAllRole(value) {
		if (!this.check()) return false;
		const roles = this.user.all_roles;
		return difference(value, roles).length === 0;
	}

	/**
	 * Check if user has permission
	 */
	can(value) {
		if (!this.check()) return false;
		const permissions = this.user.all_permissions;
		return permissions.includes(value.trim()) ||
			this.isSuperAdmin();
	}

	/**
	 * Check if user does not have permission
	 */
	cannot(value) {
		return !this.can(value)
	}
}