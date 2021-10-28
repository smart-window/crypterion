import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from "react-intl";
import {Button, Divider, Empty, Form, Input, Select, Spin} from "antd";
import Widget from "admin/components/Widget";
import ApiService from "admin/support/Services/Api";
import {pipe} from "admin/support/utils/common";
import formHelper from "admin/support/Helpers/Form";
import {forEach, isEmpty} from "lodash";
import {handleError, handleFormError, handleFormSuccess, handleSuccess} from "admin/support/utils/promise";

const messages = defineMessages({
    successful : {
        defaultMessage : "Wallet updated successfully.",
        id             : "admin.configuration.updated_wallet_successfully"
    },
});

class Wallet extends Component {
    constructor(props) {
        super(props);

        this.api = new ApiService();

        this.state = {
            wallets        : [],
            confirmLoading : false,
            loading        : false
        }
    }

    componentDidMount() {
        this.fetchData();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const {axios, route} = this.api;
        const {form, intl} = this.props;

        form.validateFields((errors, values) => {
            if (isEmpty(errors)) {
                const endpoint = route('admin.settings.configuration.wallet.update');

                axios.post(endpoint.url(), values)
                    .then(response => handleFormSuccess(response, form, (data) => {
                        this.setState({confirmLoading : false});
                        this.fetchData()
                    }, intl.formatMessage(messages.successful)))
                    .catch(error => handleFormError(error, form, values, () => {
                        this.setState({confirmLoading : false});
                    }));

                this.setState({confirmLoading : true});
            }
        });
    };

    fetchData() {
        const {axios, route} = this.api;
        const {form} = this.props;
        const endpoint = route('admin.settings.configuration.wallet.data');

        this.setState({loading : true});

        axios.get(endpoint.url())
            .then(response => handleSuccess(response, (data) => {
                const fields = {};

                this.setState({
                    loading : false, wallets : data
                }, () => {
                    forEach(data, (o) => {
                        const withdrawalFee = o.withdrawal_fee;

                        if (!isEmpty(withdrawalFee)) {
                            fields[`${o.coin.identifier}.type`] = withdrawalFee.type;
                            fields[`${o.coin.identifier}.value`] = withdrawalFee.value;
                        }
                    });
                    form.setFieldsValue(fields);
                });
            }))
            .catch(error => handleError(error, () => {
                this.setState({loading : false});
            }));
    }

    componentWillUnmount() {
        this.api.cancel()
    }

    render() {
        const {form} = this.props;
        const {wallets, loading, confirmLoading} = this.state;
        const {getFieldDecorator} = form;

        return (
            <Widget
                title={
                    <FormattedMessage
                        defaultMessage="Wallet"
                        id="admin.configuration.wallet"/>
                }>
                <Form onSubmit={this.handleSubmit}
                      wrapperCol={{xs : 24, sm : 16}}
                      labelCol={{xs : 24, sm : 8}}>
                    <Divider orientation="left">
                        <FormattedMessage
                            defaultMessage="Withdrawal Fees"
                            id="admin.configuration.withdrawal_fees"/>
                    </Divider>

                    <Spin spinning={loading}>
                        {wallets.map((wallet) => (
                            <Form.Item labelAlign="left"
                                       key={wallet.coin.identifier}
                                       label={wallet.coin.name}>
                                {getFieldDecorator(`${wallet.coin.identifier}.value`, {
                                    rules : [{required : true}],
                                })(
                                    <Input
                                        className="w-100"
                                        addonBefore={getFieldDecorator(`${wallet.coin.identifier}.type`, {
                                            rules : [{required : true}],
                                        })(
                                            <Select style={{width : 150}}>
                                                <Select.Option value="percent">
                                                    <FormattedMessage
                                                        defaultMessage="Percent"
                                                        id="admin.configuration.percent"/>
                                                </Select.Option>
                                                <Select.Option value="fixed">
                                                    <FormattedMessage
                                                        defaultMessage="Fixed"
                                                        id="admin.configuration.fixed"/>
                                                </Select.Option>
                                            </Select>
                                        )}/>
                                )}
                            </Form.Item>
                        ))}

                        {isEmpty(wallets) && (
                            <Empty
                                description={
                                    <FormattedMessage
                                        id="admin.configuration.no_wallet_available"
                                        defaultMessage="No Wallet Available!"/>
                                }/>
                        )}
                    </Spin>

                    <Form.Item className="mb-0">
                        <Button type="primary" icon="save"
                                disabled={loading} htmlType="submit"
                                loading={confirmLoading}
                                shape="round">
                            <span>
                                <FormattedMessage
                                    defaultMessage="Submit"
                                    id="common.submit"/>
                            </span>
                        </Button>
                    </Form.Item>
                </Form>
            </Widget>
        );
    }
}

export default pipe(
    formHelper(),
)(Wallet);
