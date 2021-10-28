import React, {Component} from "react";
import {Col, Icon, Input, Row, Select} from "antd";
import {defineMessages} from "react-intl";
import {connect} from "react-redux";
import {pipe} from "support/utils/common";
import formHelper from "support/Helpers/Form";
import {generatePath, withRouter} from "react-router-dom";
import menuItemLinks from "containers/utils/menuItemLinks";
import {isEmpty} from "lodash";

const messages = defineMessages({
	search : {
		defaultMessage : "Search offer by label...",
		id             : "quick_marketplace_search.search_placeholder"
	}
});

class QuickMarketplaceSearch extends Component {
	onSearchKeyUp = (e) => {
		if (e.key === 'Enter') {
			this.searchMarketplaceOffer();
		}
	};

	searchMarketplaceOffer() {
		const {history, form} = this.props;
		const filters = form.getFieldsValue();

		const path = generatePath(menuItemLinks['marketplace.buy_coin'].path);

		if (!isEmpty(history)) {
			return history.push(path, {filters});
		}
	};

	render() {
		const {intl, form, wallets} = this.props;
		const {getFieldDecorator} = form;
		return (
			<React.Fragment>
				<Row gutter={8} className="w-100">
					<Col span={16}>
						{getFieldDecorator('label')(
							<Input onKeyUp={this.onSearchKeyUp}
							       placeholder={intl.formatMessage(messages.search)}
							       prefix={<Icon type="search"/>}/>
						)}
					</Col>
					<Col span={8}>
						{getFieldDecorator('coin_identifier', {
							initialValue : wallets[0] && wallets[0].coin.identifier
						})(
							<Select className="w-100">
								{wallets.map((wallet) => (
									<Select.Option key={wallet.coin.id} value={wallet.coin.identifier}>
										{wallet.coin.name}
									</Select.Option>
								))}
							</Select>
						)}
					</Col>
				</Row>
			</React.Fragment>
		);
	}
}

const mapStateToProps = ({
	collections : {
		wallets
	},
}) => ({
	wallets
});
export default pipe(
	connect(
		mapStateToProps
	),
	formHelper(),
	withRouter,
)(QuickMarketplaceSearch);

