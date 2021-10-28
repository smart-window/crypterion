import React, {Component} from 'react';
import {Button, Tag, Typography} from "antd";
import Widget from "admin/components/Widget";
import {FormattedMessage, injectIntl} from "react-intl";
import AsyncTable from "admin/components/AsyncTable";
import {route} from "admin/support/Services/Api";
import Auth from "admin/support/Auth";
import {formatUTCDate, pipe, sortDate} from "admin/support/utils/common";
import {connect} from "react-redux";
import {truncate} from "lodash";
import UserTableCell from "admin/components/UserTableCell";
import FilterResult from "./components/FilterResult";

const {Paragraph} = Typography;

class Transactions extends Component {

    clearFilter = () => {
        this.table.clearFilter();
    };

    applyFilter = (filters) => {
        this.table.applyFilter(filters);
    };

    columns = () => {
        return [
            {
                title  : <FormattedMessage
                    defaultMessage="User"
                    id="admin.wallets.user"/>,
                key    : 'user',
                render : (text, record) => (
                    <UserTableCell user={record.wallet_account.user}/>
                )
            },
            {
                title     : 'Amount',
                dataIndex : 'value',
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
                title     : 'Description',
                dataIndex : 'description',
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
                title     : 'Balance After',
                dataIndex : 'balance',
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
            },
        ];
    };

    render() {
        const endpoint = route("admin.wallets.transactions.table");

        return (
            <div>
                <Widget styleName="cp-card-table"
                        extra={
                            <Button className="m-0" shape="circle"
                                    onClick={() => this.table.fetchData()}
                                    type="primary" icon="reload"/>
                        }
                        title={
                            <FormattedMessage
                                defaultMessage="Transfer Records"
                                id="wallet.transfer_records"/>
                        }>
                    <div className="d-block px-3 mt-3 ">
                        <FilterResult
                            onApply={this.applyFilter}
                            onClear={this.clearFilter}/>
                    </div>

                    <AsyncTable
                        route={endpoint.url()}
                        columns={this.columns()}
                        ref={(table) => this.table = table}
                        className="mt-1"
                        scroll={{x : true, y : false}}
                        size="middle"/>
                </Widget>
            </div>
        );
    }
}

const mapStateToProps = ({
    auth
}) => ({
    auth : new Auth(auth)
});

export default pipe(
    injectIntl,
    connect(
        mapStateToProps
    )
)(Transactions);
