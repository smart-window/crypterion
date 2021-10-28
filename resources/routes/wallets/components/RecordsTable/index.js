import React, {Component} from 'react';
import {Tag, Typography} from "antd";
import Widget from "components/Widget";
import {FormattedMessage, injectIntl} from "react-intl";
import AsyncTable from "components/AsyncTable";
import {route} from "support/Services/Api";
import Auth from "support/Auth";
import {formatUTCDate, pipe, sortDate} from "support/utils/common";
import {connect} from "react-redux";
import {mapValues, truncate, values} from "lodash";

const {Paragraph} = Typography;

class RecordsTable extends Component {
    columns = () => {
        const {accounts} = this.props;

        return [
            {
                title     : 'Amount',
                dataIndex : 'formatted_value_price',
                render    : (text, record) => (
                    <span>
                        {record.type === 'receive' ?
                            <span className="cp-text-success">
                                {text}
                            </span> :
                            <span className="cp-text-danger">
                                {text}
                            </span>
                        }
                    </span>
                )
            },
            {
                title     : 'Date',
                dataIndex : 'created_at',
                sorter    : (a, b) => sortDate(a.created_at, b.created_at),
                render    : text => (
                    <div style={{whiteSpace : 'nowrap'}}>
                        {formatUTCDate(text)}
                    </div>
                ),
            },
            {
                title     : 'Status',
                dataIndex : 'confirmed',
                render    : (text) => {
                    const isConfirmed = text === "true" ||
                        (typeof text === "boolean" && text);

                    return (
                        <span>
                            {isConfirmed ?
                                <Tag color="green">
                                    <FormattedMessage
                                        defaultMessage="confirmed"
                                        id="wallet.transaction_confirmed"/>
                                </Tag> :
                                <Tag color="red">
                                    <FormattedMessage
                                        defaultMessage="unconfirmed"
                                        id="wallet.transaction_unconfirmed"/>
                                </Tag>
                            }
                        </span>
                    )
                },
            },
            {
                title     : 'Value',
                dataIndex : 'value',
            },
            {
                title     : 'Hash',
                dataIndex : 'hash',
                render    : (text) => {
                    return !text ? text : (
                        <Paragraph copyable={{text}}>
                            {truncate(text, {'length' : 14})}
                        </Paragraph>
                    )
                }
            },
            {
                title     : 'Coin',
                dataIndex : 'coin',
                fixed     : 'right',
                onFilter  : (value, record) => {
                    return record.coin.includes(value)
                },
                filters   : values(mapValues(accounts, (o) => {
                    return {
                        text  : o.wallet.coin.name,
                        value : o.wallet.coin.name
                    }
                })),
            },
        ];
    };

    render() {
        const endpoint = route("user.transfer-records-table");

        return (
            <Widget styleName="cp-card-table"
                    title={
                        <FormattedMessage
                            defaultMessage="Transfer Records"
                            id="wallet.transfer_records"/>
                    }>
                <AsyncTable
                    route={endpoint.url()}
                    columns={this.columns()}
                    className="mt-1"
                    scroll={{x : true, y : false}}
                    size="middle"/>
            </Widget>
        );
    }
}

const mapStateToProps = ({
    wallet : {accounts},
    auth
}) => ({
    accounts,
    auth : new Auth(auth)
});

export default pipe(
    injectIntl,
    connect(
        mapStateToProps
    )
)(RecordsTable);
