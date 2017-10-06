import * as _ from 'lodash';
import * as React from 'react';
import Paper from 'material-ui/Paper';
import {colors} from 'material-ui/styles';
import {Blockchain} from 'ts/blockchain';
import {Dispatcher} from 'ts/redux/dispatcher';
import {AssetToken, Side, TokenByAddress, BlockchainErrs, Token, TokenState} from 'ts/types';
import {AssetPicker} from 'ts/components/generate_order/asset_picker';
import {InputLabel} from 'ts/components/ui/input_label';
import {TokenIcon} from 'ts/components/ui/token_icon';

const TOKEN_ICON_DIMENSION = 80;

interface TokenInputProps {
    blockchain: Blockchain;
    blockchainErr: BlockchainErrs;
    dispatcher: Dispatcher;
    label: string;
    side: Side;
    networkId: number;
    assetToken: AssetToken;
    updateChosenAssetToken: (side: Side, token: AssetToken) => void;
    tokenByAddress: TokenByAddress;
    userAddress: string;
}

interface TokenInputState {
    isHoveringIcon: boolean;
    isPickerOpen: boolean;
    trackCandidateTokenIfExists?: Token;
}

export class TokenInput extends React.Component<TokenInputProps, TokenInputState> {
    constructor(props: TokenInputProps) {
        super(props);
        this.state = {
            isHoveringIcon: false,
            isPickerOpen: false,
        };
    }
    public render() {
        const token = this.props.tokenByAddress[this.props.assetToken.address];
        const iconStyles = {
            cursor: 'pointer',
            opacity: this.state.isHoveringIcon ? 0.5 : 1,
        };
        return (
            <div className="relative">
                <div className="pb1">
                    <InputLabel text={this.props.label} />
                </div>
                <Paper
                    zDepth={1}
                    style={{cursor: 'pointer'}}
                    onMouseEnter={this.onToggleHover.bind(this, true)}
                    onMouseLeave={this.onToggleHover.bind(this, false)}
                    onClick={this.onAssetClicked.bind(this)}
                >
                    <div
                        className="mx-auto pt2"
                        style={{width: TOKEN_ICON_DIMENSION, ...iconStyles}}
                    >
                        <TokenIcon token={token} diameter={TOKEN_ICON_DIMENSION} />
                    </div>
                    <div className="py1 center" style={{color: colors.grey500}}>
                        {token.name}
                    </div>
                </Paper>
                <AssetPicker
                    userAddress={this.props.userAddress}
                    networkId={this.props.networkId}
                    blockchain={this.props.blockchain}
                    dispatcher={this.props.dispatcher}
                    isOpen={this.state.isPickerOpen}
                    currentTokenAddress={this.props.assetToken.address}
                    onTokenChosen={this.onTokenChosen.bind(this)}
                    tokenByAddress={this.props.tokenByAddress}
                />
            </div>
        );
    }
    private onTokenChosen(tokenAddress: string) {
        const assetToken: AssetToken = {
            address: tokenAddress,
            amount: this.props.assetToken.amount,
        };
        this.props.updateChosenAssetToken(this.props.side, assetToken);
        this.setState({
            isPickerOpen: false,
        });
    }
    private onToggleHover(isHoveringIcon: boolean) {
        this.setState({
            isHoveringIcon,
        });
    }
    private onAssetClicked() {
        if (this.props.blockchainErr !== '') {
            this.props.dispatcher.updateShouldBlockchainErrDialogBeOpen(true);
            return;
        }

        this.setState({
            isPickerOpen: true,
        });
    }
}
