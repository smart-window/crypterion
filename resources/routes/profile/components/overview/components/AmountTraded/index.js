import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import Widget from "components/Widget";
import {List} from "antd";

class AmountTraded extends Component {
    render() {
        const {user} = this.props;
        const data = user.marketplace_stats.total_amount_sold;

        return (
            <Widget
                title={
                    <FormattedMessage
                        defaultMessage="Total Amount Traded"
                        id="common.total_amount_traded"/>
                }>
                <List dataSource={data}
                      renderItem={item => (
                          <List.Item>
                              <List.Item.Meta title={item.coin}/>
                              <span>
                                  {item.amount} <b>({item.amount_formatted_price})</b>
                              </span>
                          </List.Item>
                      )}/>
            </Widget>
        );
    }
}

export default AmountTraded;
