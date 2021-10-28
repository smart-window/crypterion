import React, {Component} from 'react';
import ApiService from "admin/support/Services/Api";
import {FormattedMessage, injectIntl} from "react-intl";
import AsyncTable from "admin/components/AsyncTable";
import {pipe} from "admin/support/utils/common";
import Widget from "admin/components/Widget";
import UserTableCell from "components/UserTableCell";
import {formatUTCDate, sortDate} from "admin/support/utils/common";
import {Alert, Tag} from "antd";
import {mapValues, values} from "lodash";

class PendingWithdrawal extends Component {
    constructor(props) {
        super(props);

        this.api = new ApiService();
    }

    columns = () => {
        return [
            {
                title  : <FormattedMessage
                    defaultMessage="User"
                    id="admin.wallets.user"/>,
                key    : 'user',
                render : (text, record) => (
                    <UserTableCell user={record.transfer_record.wallet_account.user}/>
                )
            },
            {
                title  : <FormattedMessage
                    defaultMessage="Coin"
                    id="admin.wallets.coin"/>,
                key    : 'coin',
                render : (text, record) => record.transfer_record.wallet_account.coin
            },
            {
                title  : <FormattedMessage
                    defaultMessage="Available"
                    id="admin.wallets.available"/>,
                key    : 'available',
                render : (text, record) => record.transfer_record.wallet_account.available
            },
            {
                title     : <FormattedMessage
                    defaultMessage="Address"
                    id="admin.wallets.address"/>,
                dataIndex : 'addresses',
                render    : (addresses) => (addresses || []).join('<br/>')
            },
            {
                title     : <FormattedMessage
                    defaultMessage="Amount"
                    id="admin.wallets.amount"/>,
                dataIndex : 'total_amount',
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
                title     : <FormattedMessage
                    defaultMessage="State"
                    id="admin.wallets.state"/>,
                dataIndex : 'state',
                fixed     : 'right',
                render    : (text) => {
                    let color = "blue";

                    switch (text) {
                        case 'approved':
                            color = "green";
                            break;
                        case 'rejected':
                            color = "red";
                            break;
                    }

                    return (
                        <span>
                            <Tag color={color}>
                                {text}
                            </Tag>
                        </span>
                    )
                },
                onFilter  : (value, record) => {
                    return record.state.includes(value)
                },
                filters   : [
                    {text : 'Approved', value : 'approved'},
                    {text : 'Pending', value : 'pending'},
                    {text : 'Rejected', value : 'rejected'},
                ],
            },
        ];
    };

    componentWillUnmount() {
        this.api.cancel()
    }

    render() {
        const {route} = this.api;
        const endpoint = route("admin.wallets.pending-approval.table");

        return (
            <div>
                <Alert type="info"
                       message={
                           <div className="font-weight-medium">
                               <FormattedMessage
                                   defaultMessage="Information"
                                   id="admin.wallets.information"/>
                           </div>
                       }
                       className="mb-3"
                       description={
                           <ol className="pl-3 mb-0">
                               <li>
                                   <FormattedMessage
                                       defaultMessage={
                                           "Action on a pending approval cannot be taking here, it needs to be done over Bitgo interface."
                                       }
                                       id="admin.wallets.pending_approval_action_notice"/>
                               </li>
                               <li>
                                   <FormattedMessage
                                       defaultMessage={
                                           "The available balance shown on the table indicates the user's balance {after} sending the withdrawal request."
                                       }
                                       id="admin.wallets.pending_approval_balance_notice"
                                       values={{after : <b>AFTER</b>}}/>
                               </li>
                               <li>
                                   <FormattedMessage
                                       defaultMessage={
                                           "Users are not credited automatically after a withdrawal request is rejected, you will need to do that manually."
                                       }
                                       id="admin.wallets.pending_approval_rejection_notice"/>
                               </li>
                           </ol>
                       }
                       showIcon/>

                <Widget styleName="cp-card-table"
                        title={
                            <FormattedMessage
                                defaultMessage="Pending Approval"
                                id="admin.wallets.pending_approval"/>
                        }>
                    <AsyncTable
                        columns={this.columns()}
                        route={endpoint.url()}
                        rowKey="id"
                        ref={(table) => this.table = table}
                        className="mt-1"
                        scroll={{x : true, y : false}}
                        size="middle"/>
                </Widget>
            </div>
        );
    }
}

export default pipe(
    injectIntl,
)(PendingWithdrawal);
