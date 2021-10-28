import React, {Component, Fragment} from 'react';
import Auth from "support/Auth";
import {pipe, sortDate} from "support/utils/common";
import {connect} from "react-redux";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import {handleError, handleSuccess} from "support/utils/promise";
import ApiService, {uploadRequest} from "support/Services/Api";
import {filter, find, findIndex, get, has, isEmpty, map, uniqBy} from "lodash";
import Loading from "components/Loading";
import {Avatar, Col, Drawer, Icon, Input, List, message as messageApi, Row, Spin, Upload} from "antd";
import UserAvatar from "components/UserAvatar";
import ChatNotFound from "./components/ChatNotFound";
import TextCell from "./components/TextCell";
import Pagination from "support/Helpers/Pagination";
import SimpleBar from "simplebar";
import InfiniteScroll from "react-infinite-scroller";
import ActivityCell from "./components/ActivityCell";
import AttachmentCell from "./components/AttachmentCell";
import PrivateBroadcast from "support/Services/Broadcast/Private";
import MarketplaceTrade from "./components/MarketplaceTrade";
import MarketplaceRating from "./components/MarketplaceRating";
import {Link} from "react-router-dom";
import Carousel, {Modal, ModalGateway} from 'react-images';

const {TextArea} = Input;

const messages = defineMessages({
    inputMessage : {
        defaultMessage : "Type a message...",
        id             : "chats.input_message_placeholder"
    },
});

class Body extends Component {
    constructor(props) {
        super(props);

        this.broadcast = new PrivateBroadcast();
        this.api = new ApiService();

        this.state = {
            chat                        : {},
            selectedImage               : 0,
            carouselVisibility          : false,
            loadingChat                 : false,
            data                        : [],
            hasMore                     : false,
            params                      : {
                total    : 0,
                pageSize : 40,
                current  : 1
            },
            marketplaceTrade            : {},
            marketplaceTradeDrawerState : false,
            loading                     : false,
            loadingMore                 : false,
            text                        : "",
            sendingAttachment           : false,
            sendingText                 : false,
        }
    }

    componentDidMount() {
        this.fetchChat();
    }

    resetBroadcastChannel() {
        const {chat} = this.state;
        if (!isEmpty(chat)) {
            this.broadcast.setChannel('App.Chat.' + chat.id)
        } else {
            this.broadcast.unbind();
        }
    }

    openCarousel = (id) => {
        let selectedImage = findIndex(this.getImagesData(), (o) => {
            return o.id === id;
        })

        if (selectedImage >= 0) {
            this.setState({carouselVisibility : true, selectedImage});
        }
    }

    closeCarousel = () => {
        this.setState({carouselVisibility : false});
    }

    getImagesData() {
        const {data} = this.state;

        const messages = filter(data, (o) => {
            return get(o, 'type') === 'attachment' && this.isImage(get(o, 'attachment.mime_type'))
        });

        return map(messages, (o) => {
            return {
                src     : get(o, 'attachment.url'),
                caption : get(o, 'attachment.name'),
                id      : get(o, 'id')
            }
        })
    }

    isImage(mimeType) {
        switch (mimeType) {
            case 'image/gif':
            case 'image/jpeg':
            case 'image/png':
                return true;
            default:
                return false;
        }
    }

    fetchMarketplaceTrade() {
        const {chat} = this.state;
        if (isEmpty(chat) || !chat.id) return;
        const {axios, route} = this.api;

        const endpoint = route('chats.latest-marketplace-trade', {
            chat : chat.id
        });

        axios.post(endpoint.url())
            .then(response => handleSuccess(response, (data) => {
                this.setState({marketplaceTrade : data}, () => {
                    this.scrollToBottom();
                });
            }))
            .catch(error => handleError(error));
    }

    bindBroadcastEvents() {
        this.resetBroadcastChannel();
        this.broadcast.listen('MarketplaceTradeSaved', this.marketplaceTradeSavedListener);
        this.broadcast.listen('NewChatMessage', this.newChatMessageListener);
    }

    marketplaceTradeSavedListener = (e) => {
        this.fetchMarketplaceTrade();
    };

    newChatMessageListener = (e) => {
        const {auth} = this.props;
        if (isEmpty(e.message)) return;
        const message = e.message;

        if (message.user_id !== auth.user.id) {
            this.updateParticipation(message.chat_id);
        }

        this.setState(({data}) => {
            return {
                data : this.sortMessages(data.concat(message))
            }
        }, () => {
            this.scrollToBottom();
        });
    };

    onMarketplaceTradeUpdate = () => {
        this.toggleMarketplaceTradeDrawer();
        this.fetchMarketplaceTrade();
    };

    updateParticipation = (chatId) => {
        const {axios, route} = this.api;
        if (!chatId) return;

        const endpoint = route('chats.update-participation', {
            chat : chatId
        });

        axios.post(endpoint.url())
            .then(response => handleSuccess(response))
            .catch(error => handleError(error));
    };

    scrollToBottom() {
        const container = this.scrollParent;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    };

    canSendMessage() {
        return (
            !isEmpty(this.state.chat) &&
            !this.state.sendingAttachment &&
            !this.state.sendingText &&
            this.showMarketplaceTrades()
        )
    };

    sendText = () => {
        const {chat, text} = this.state;
        if (!text || !this.canSendMessage()) return;
        const {axios, route} = this.api;

        const endpoint = route('chats.messages.save-text', {
            chat : chat.id
        });

        axios.post(endpoint.url(), {body : text})
            .then(response => handleSuccess(response, () => {
                this.setState({sendingText : false});
            }))
            .catch(error => handleError(error, () => {
                this.setState({sendingText : false});
            }));

        this.setState({sendingText : true, text : ""}, () => {
            this.scrollToBottom();
        });
    };

    beforeUpload = (file) => {
        const status = this.canSendMessage();
        this.setState({
            sendingAttachment : status
        }, () => {
            if (status) this.scrollToBottom();
        });
        return status;
    };

    handleUploadSuccess = (message) => {
        this.setState(({data}) => {
            return {
                sendingAttachment : false,
                data              : this.sortMessages(data.concat(message)),
            }
        }, () => {
            this.scrollToBottom();
        });
    };

    handleUploadError = (errors) => {
        if (has(errors, 'file')) {
            errors.file.forEach(error => messageApi.error(error));
        }
    };

    fetchMessages = () => {
        const {filters, chat, params} = this.state;
        const nextParams = {...params, current : 1};

        if (isEmpty(chat) || !chat.id) return;

        const endpoint = this.api.route('chats.messages.table', {
            chat : chat.id
        }).url();
        this.mesagePagination = new Pagination(this.api, endpoint);

        this.setState({loading : true, data : []});

        this.mesagePagination.fetchData(
            nextParams, filters, (page) => {
                const nextHasMore = Boolean(page.links.next);

                this.setState(() => {
                    return {
                        data    : this.sortMessages(page.data),
                        loading : false,
                        hasMore : false,
                        params  : {
                            ...nextParams, total : page.meta.total
                        },
                    }
                }, () => {
                    const element = this.scrollParent;
                    if (typeof element !== "undefined") {
                        element.scrollTop = element.scrollHeight;
                        this.setState({hasMore : nextHasMore});
                        console.log('Showing Latest Messages')
                    }
                })
            }, () => {
                this.setState({loading : false})
            }
        );
    };

    sortMessages = (messages) => {
        if (!Array.isArray(messages)) return messages;
        messages = messages.sort((a, b) => sortDate(a.created_at, b.created_at));
        return uniqBy(messages, 'id');
    };

    canLoadMoreMessages() {
        const {hasMore, loadingMore, loading} = this.state;
        return (hasMore && !loadingMore && !loading);
    }

    onLoadMore = () => {
        if (!this.canLoadMoreMessages()) return;

        const {params, filters} = this.state;
        let nextParams = {...params, current : params.current + 1};

        this.mesagePagination.fetchData(
            nextParams, filters, (page) => {
                this.setState(({data}) => {
                    return {
                        data        : this.sortMessages(data.concat(page.data)),
                        params      : {...nextParams, total : page.meta.total},
                        loadingMore : false,
                        hasMore     : Boolean(page.links.next),
                    }
                })
            }, () => {
                this.setState({loadingMore : false})
            }
        );

        this.setState({loadingMore : true});
    };

    componentWillUnmount() {
        this.broadcast.unbind();
        this.api.cancel();
    }

    fetchChat() {
        const {axios, route} = this.api;
        const activeChat = this.props.activeChat;
        if (isEmpty(activeChat)) return;

        const endpoint = route('chats.get', {
            chat : activeChat.token
        });

        axios.post(endpoint.url())
            .then(response => handleSuccess(response, (data) => {
                this.setState({
                    loadingChat : false, chat : data
                }, () => {
                    this.fetchMessages();
                    this.fetchMarketplaceTrade();
                    this.updateParticipation(data.id);
                    this.bindBroadcastEvents();
                });
            }))
            .catch(error => handleError(error, () => {
                this.setState({loadingChat : false});
            }));

        this.setState({loadingChat : true, chat : {}});
    }

    getHighlightedParticipant() {
        if (isEmpty(this.highlightedParticpant)) {
            const chat = this.state.chat;
            const auth = this.props.auth;
            const participants = chat.participants;

            this.highlightedParticpant = find(participants, function (o) {
                return !isEmpty(o.user) &&
                    o.user.id !== auth.user.id;
            });
        }
        return this.highlightedParticpant;
    }

    getUserAvatar = () => {
        const participant = this.getHighlightedParticipant();

        if (!isEmpty(participant)) {
            return (
                <UserAvatar
                    showPresence={false}
                    user={participant.user}
                    size={40}/>
            );
        } else {
            return (
                <Avatar icon="message"
                        size={40}/>
            );
        }
    };

    getChatTitle() {
        const {chat} = this.state;
        const participant = this.getHighlightedParticipant();
        const participants = chat.participants;

        if (!isEmpty(participant)) {
            const profileLink = (
                <Link to={`/profile/${participant.user.name}`}>
                    {participant.user.name}
                </Link>
            );

            if (participants.length > 1) {
                return (
                    <FormattedMessage
                        defaultMessage="{user} and {total} other(s)"
                        id="chats.view_title"
                        values={{
                            total : (participants.length - 1),
                            user  : profileLink
                        }}/>
                )
            } else {
                return profileLink;
            }
        } else {
            return (
                <FormattedMessage
                    defaultMessage="You and {total} other(s)"
                    id="chats.default_title"
                    values={{
                        total : participants.length
                    }}/>
            );
        }
    }

    onChangeText = (e) => {
        this.setState({text : e.target.value})
    };

    handleTextKeyUp = (e) => {
        if (e.key === 'Enter') this.sendText();
    };

    toggleMarketplaceTradeDrawer = () => {
        this.changeFullscreen(false);
        this.setState(({marketplaceTradeDrawerState}) => {
            return {
                marketplaceTradeDrawerState : !marketplaceTradeDrawerState,
            };
        });
    };

    changeFullscreen(fullscreen) {
        const {onChangeFullscreen} = this.props;
        if (typeof onChangeFullscreen === "function") {
            return onChangeFullscreen(fullscreen);
        }
    }

    setScrollWrapper = (ref) => {
        if (ref !== this.scrollWrapper && ref !== null) {
            const simpleBar = new SimpleBar(ref);
            this.scrollParent = simpleBar.getScrollElement();
            this.scrollWrapper = ref
        }
    };

    getStatusColor = (status) => {
        switch (status) {
            case 'successful':
                return "#52c41a";
            case 'active':
                return "#2db7f5";
            case 'dispute':
                return "#faad14";
            case "cancelled":
                return "#f5222d";
            default :
                return null;
        }
    };

    showMarketplaceTrades() {
        const {marketplaceTrade} = this.state;
        return !isEmpty(marketplaceTrade) && (
            marketplaceTrade.status === "active" ||
            marketplaceTrade.status === "dispute"
        )
    }

    render() {
        const {
            chat, data, text, marketplaceTrade,
            loadingChat, loading, loadingMore, hasMore,
            marketplaceTradeDrawerState,
            selectedImage, carouselVisibility
        } = this.state;

        const {
            auth, intl, fullscreen,
            onToggleFullscreen, onToggleDrawer
        } = this.props;

        if (!isEmpty(chat)) {
            const uploadEndpoint = this.api.route('chats.messages.save-attachment', {
                chat : chat.id
            });

            return (
                <Fragment>
                    <div className="cp-chat-main animated fadeIn">
                        <div className="cp-chat-main-header">
                            <span className="d-block d-lg-none cp-chat-btn">
                                <i className="cp-icon-btn la la-comments"
                                   onClick={onToggleDrawer}/>
                            </span>
                            <div className="cp-chat-main-header-info">
                                <div className="cp-chat-avatar mr-2 d-none d-sm-block">
                                    {this.getUserAvatar()}
                                </div>

                                <div className="cp-chat-contact-name">
                                    {this.getChatTitle()}
                                </div>
                            </div>

                            {this.showMarketplaceTrades() && (
                                <Icon onClick={this.toggleMarketplaceTradeDrawer}
                                      type="dollar-circle" theme="filled"
                                      className="animated flash infinite slow mr-2 cp-fs-2x cp-icon-btn"
                                      style={{
                                          color : this.getStatusColor(marketplaceTrade.status)
                                      }}/>
                            )}

                            {fullscreen ? (
                                <i className="cp-icon-btn la la-compress ml-2 cp-fs-2x"
                                   onClick={onToggleFullscreen}/>
                            ) : (
                                <i className="cp-icon-btn la la-expand ml-2 cp-fs-2x"
                                   onClick={onToggleFullscreen}/>
                            )}
                        </div>

                        {this.showMarketplaceTrades() && (
                            <Drawer visible={marketplaceTradeDrawerState}
                                    closable={false}
                                    width={320}
                                    onClose={this.toggleMarketplaceTradeDrawer}
                                    placement="right">
                                <MarketplaceTrade
                                    onUpdate={this.onMarketplaceTradeUpdate}
                                    trade={marketplaceTrade}/>
                            </Drawer>
                        )}

                        <Spin spinning={loading}>
                            <div ref={this.setScrollWrapper}
                                 className="cp-chat-list-scroll"
                                 data-simplebar={true}>
                                <InfiniteScroll useWindow={false}
                                                loadMore={this.onLoadMore}
                                                getScrollParent={() => this.scrollParent}
                                                isReverse={true}
                                                hasMore={!loadingMore && hasMore}
                                                pageStart={1}
                                                initialLoad={false}>
                                    {loadingMore && <Loading/>}

                                    <List dataSource={data}
                                          rowKey={(record) => record.id}
                                          renderItem={item => {
                                              const isOwner = (item.user_id === auth.user.id);

                                              switch (item.type) {
                                                  case 'text':
                                                      return (
                                                          <TextCell
                                                              mode={isOwner ? 'right' : 'left'}
                                                              message={item}/>
                                                      );
                                                  case 'attachment':
                                                      return (
                                                          <AttachmentCell
                                                              openCarousel={this.openCarousel}
                                                              mode={isOwner ? 'right' : 'left'}
                                                              message={item}/>
                                                      );
                                                  case 'activity':
                                                      return (
                                                          <ActivityCell
                                                              message={item}/>
                                                      );
                                                  default:
                                                      return <List.Item/>
                                              }
                                          }}/>
                                    <MarketplaceRating
                                        trade={marketplaceTrade}/>
                                </InfiniteScroll>
                            </div>
                        </Spin>

                        <div className="cp-chat-main-footer">
                            <Row gutter={8} className="d-flex align-items-center">
                                <Col xs={18} sm={20}>
                                    <TextArea onKeyUp={this.handleTextKeyUp}
                                              placeholder={intl.formatMessage(messages.inputMessage)}
                                              rows={2} value={text}
                                              disabled={!this.canSendMessage()}
                                              autoFocus={true}
                                              style={{maxHeight : '48px', resize : 'none'}}
                                              onChange={this.onChangeText}/>
                                </Col>
                                <Col xs={6} sm={4}>
                                    <Row gutter={4}>
                                        <Col span={12}>
                                            <div className="cp-icon-btn">
                                                <Upload
                                                    showUploadList={false}
                                                    beforeUpload={this.beforeUpload}
                                                    action={uploadEndpoint.url()}
                                                    customRequest={uploadRequest}
                                                    onSuccess={this.handleUploadSuccess}
                                                    onError={this.handleUploadError}
                                                    withCredentials={true}>
                                                    <i className="la la-paperclip cp-fs-2x"/>
                                                </Upload>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <i className="cp-icon-btn la la-paper-plane cp-fs-2x"
                                               onClick={this.sendText}/>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <ModalGateway>
                        {carouselVisibility && (
                            <Modal onClose={this.closeCarousel}>
                                <Carousel currentIndex={selectedImage}
                                          views={this.getImagesData()}/>
                            </Modal>
                        )}
                    </ModalGateway>
                </Fragment>
            );
        } else if (!loadingChat) {
            return <ChatNotFound onToggleDrawer={onToggleDrawer}/>;
        } else {
            return <Loading/>;
        }
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
    injectIntl,
)(Body);
