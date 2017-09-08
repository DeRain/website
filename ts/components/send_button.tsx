import * as _ from 'lodash';
import {ZeroEx} from '0x.js';
import * as React from 'react';
import * as BigNumber from 'bignumber.js';
import RaisedButton from 'material-ui/RaisedButton';
import {BlockchainCallErrs} from 'ts/types';
import {SendDialog} from 'ts/components/send_dialog';
import {Token} from 'ts/types';
import {constants} from 'ts/utils/constants';
import {utils} from 'ts/utils/utils';
import {Dispatcher} from 'ts/redux/dispatcher';
import {errorReporter} from 'ts/utils/error_reporter';
import {Blockchain} from 'ts/blockchain';

interface SendButtonProps {
    token: Token;
    dispatcher: Dispatcher;
    blockchain: Blockchain;
    onError: () => void;
}

interface SendButtonState {
    isSendDialogVisible: boolean;
    isSending: boolean;
}

export class SendButton extends React.Component<SendButtonProps, SendButtonState> {
    public constructor(props: SendButtonProps) {
        super(props);
        this.state = {
            isSendDialogVisible: false,
            isSending: false,
        };
    }
    public render() {
        const labelStyle = this.state.isSending ? {fontSize: 10} : {};
        return (
            <div>
                <RaisedButton
                    style={{width: '100%'}}
                    labelStyle={labelStyle}
                    disabled={this.state.isSending}
                    label={this.state.isSending ? 'Sending...' : 'Send'}
                    onClick={this.toggleSendDialog.bind(this)}
                />
                <SendDialog
                    isOpen={this.state.isSendDialogVisible}
                    onComplete={this.onSendAmountSelectedAsync.bind(this)}
                    onCancelled={this.toggleSendDialog.bind(this)}
                    token={this.props.token}
                />
            </div>
        );
    }
    private toggleSendDialog() {
        this.setState({
            isSendDialogVisible: !this.state.isSendDialogVisible,
        });
    }
    private async onSendAmountSelectedAsync(recipient: string, value: BigNumber.BigNumber) {
        this.setState({
            isSending: true,
        });
        this.toggleSendDialog();
        const token = this.props.token;
        let balance = token.balance;
        try {
            await this.props.blockchain.transferAsync(token.address, recipient, value);
            const tokenAmount = ZeroEx.toUnitAmount(value, token.decimals);
            const flashMessage = `Successfully transferred ${tokenAmount.toString()} ${token.symbol} to ${recipient}`;
            this.props.dispatcher.showFlashMessage(flashMessage);
            balance = balance.minus(value);
            const updatedToken = _.assign({}, token, {
                balance,
            });
            this.props.dispatcher.updateTokenByAddress([updatedToken]);
        } catch (err) {
            const errMsg = `${err}`;
            if (_.includes(errMsg, BlockchainCallErrs.USER_HAS_NO_ASSOCIATED_ADDRESSES)) {
                this.props.dispatcher.updateShouldBlockchainErrDialogBeOpen(true);
                return;
            } else if (!_.includes(errMsg, 'User denied transaction')) {
                utils.consoleLog(`Unexpected error encountered: ${err}`);
                utils.consoleLog(err.stack);
                await errorReporter.reportAsync(err);
                this.props.onError();
            }
        }
        this.setState({
            isSending: false,
        });
    }
}
