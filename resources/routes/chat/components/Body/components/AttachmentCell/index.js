import React, {Component} from 'react';
import UserAvatar from "components/UserAvatar";
import {truncate, utcDateCalendarTime} from "support/utils/common";
import {FormattedMessage} from "react-intl";
import {isEmpty} from "lodash";
import {Link} from "react-router-dom";
import {Button} from "antd";

class AttachmentCell extends Component {
    getUserAvatar = () => {
        const {message} = this.props;
        const user = message.user;
        return (
            <Link to={`/profile/${user.name}`}>
                <UserAvatar
                    className="align-self-end"
                    user={user} size={40}/>
            </Link>
        )
    };

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

    getAttachmentDetail() {
        const {message, openCarousel} = this.props;
        const attachment = message.attachment;

        if (!isEmpty(attachment)) {
            const link = attachment.url;

            return (
                <React.Fragment>
                    {this.isImage(attachment.mime_type) && (
                        <div className="cp-thumbnail"
                             onClick={() => openCarousel(message.id)}>
                            <img src={link} alt={attachment.name}/>
                        </div>
                    )}

                    <div className="cp-attachment d-flex">
                        <span className="mr-2">
                            <i className="la la-paperclip cp-fs-lg"/>
                        </span>
                        <span className="mr-2 fs-sm">
                            {truncate(attachment.name, 20)}
                        </span>
                        <Button className="ml-0 mb-0"
                                type="dashed"
                                shape="circle" href={link}
                                icon="download"/>
                    </div>
                </React.Fragment>
            );
        } else {
            return (
                <div className="cp-attachment d-flex">
                    <i className="la la-ban cp-fs-lg mr-2"/>
                    <span>
                        <FormattedMessage
                            defaultMessage="Attachment Deleted"
                            id="chats.attachment_deleted"/>
                    </span>
                </div>
            )
        }
    }

    isImageType = (mimeType) => {
        return mimeType === 'image/jpeg' || mimeType === 'image/png'
    };

    getTimestamp() {
        const {message} = this.props;
        return (
            <small className="text-muted">
                {utcDateCalendarTime(message.created_at)}
            </small>
        );
    }

    render() {
        const {mode} = this.props;

        const itemClass = mode === 'right' ?
            "cp-chat-item flex-row-reverse" : "cp-chat-item";

        return (
            <div className={itemClass}>
                {this.getUserAvatar()}
                <div className="cp-bubble-block">
                    <div className="cp-bubble d-inline-block">
                        <div className="cp-message mb-2">
                            {this.getAttachmentDetail()}
                        </div>
                        <div className="cp-time text-right">
                            {this.getTimestamp()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AttachmentCell;
