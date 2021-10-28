import React, {Component} from 'react';
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import ApiService from "support/Services/Api";
import {handleError, handleSuccess} from "support/utils/promise";
import {Button, Table} from "antd";
import Widget from "components/Widget";
import NewTokenModal from "./components/NewTokenModal";

const messages = defineMessages({
    actionSuccessful : {
        defaultMessage : "Your action was successful.",
        id             : "profile.developer.oauth_action_successful"
    },
});

class Developer extends Component {
    constructor(props) {
        super(props);

        this.api = new ApiService();

        this.state = {
            newToken : false,
            data      : [],
            loading   : false
        }
    }

    componentDidMount() {
        this.fetchTokens();
    }

    fetchTokens() {
        const {axios, route} = this.api;
        const endpoint = "/oauth/personal-access-tokens";
        this.setState({loading : true});

        axios.get(endpoint)
            .then(response => handleSuccess(response, (data) => {
                this.setState({data, loading : false});
            }))
            .catch(error => handleError(error, () => {
                this.setState({loading : false});
            }));
    }

    deleteToken(token) {
        const {axios, route} = this.api;
        const {intl} = this.props;

        const endpoint = '/oauth/personal-access-tokens/' + token.id;

        axios.delete(endpoint)
            .then(response => handleSuccess(response, () => {
                this.fetchTokens();
            }, intl.formatMessage(messages.actionSuccessful)))
            .catch(error => handleError(error));
    }

    columns = () => {
        return [
            {
                title     : <FormattedMessage
                    defaultMessage="Name"
                    id="profile.developer.name"/>,
                dataIndex : 'name',
            },
            {
                title     : <FormattedMessage
                    defaultMessage="ID"
                    id="profile.developer.id"/>,
                dataIndex : 'id',
            },
            {
                title  : <FormattedMessage
                    defaultMessage="Action"
                    id="common.action"/>,
                key    : 'action',
                render : (text, record) => (
                    <Button className="m-0" shape="circle"
                            onClick={(e) => this.deleteToken(record)}
                            type="danger" icon="delete"/>
                ),
            },
        ];
    };

    toggleNewTokenModal = () => {
        this.setState(({newToken}) => {
            return {newToken : !newToken}
        })
    };

    handleNewTokenSuccess = () => {
        this.fetchTokens();
    };

    componentWillUnmount() {
        this.api.cancel()
    }

    render() {
        const {loading, data, newToken} = this.state;

        return (
            <Widget styleName="cp-card-table"
                    title={
                        <FormattedMessage
                            defaultMessage="Personal Access Tokens"
                            id="profile.developer.oauth_clients"/>
                    }
                    extra={
                        <Button type="primary" shape="circle"
                                onClick={this.toggleNewTokenModal}
                                className="m-0" icon="plus"/>
                    }>
                <NewTokenModal
                    onCancel={this.toggleNewTokenModal}
                    onSuccess={this.handleNewTokenSuccess}
                    visible={newToken}/>

                <Table className="mt-1"
                       rowKey="id"
                       columns={this.columns()}
                       loading={loading}
                       size="middle"
                       scroll={{x : true, y : false}}
                       dataSource={data}/>
            </Widget>
        );
    }
}

const mapStateToProps = ({
    auth
}) => ({
    auth : new Auth(auth)
});

export default pipe(
    connect(
        mapStateToProps
    ),
    injectIntl
)(Developer);
