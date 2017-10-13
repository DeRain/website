import * as _ from 'lodash';
import * as React from 'react';
import {constants} from 'ts/utils/constants';
import {utils} from 'ts/utils/utils';
import {KindString, CustomType, TypeDocTypes, CustomTypeChild, HeaderSizes} from 'ts/types';
import {Type} from 'ts/pages/documentation/type';
import {Interface} from 'ts/pages/documentation/interface';
import {CustomEnum} from 'ts/pages/documentation/custom_enum';
import {Enum} from 'ts/pages/documentation/enum';
import {MethodSignature} from 'ts/pages/documentation/method_signature';
import {AnchorTitle} from 'ts/pages/shared/anchor_title';
import {Comment} from 'ts/pages/documentation/comment';
import {typeDocUtils} from 'ts/utils/typedoc_utils';

const KEYWORD_COLOR = '#a81ca6';

interface TypeDefinitionProps {
    customType: CustomType;
    shouldAddId?: boolean;
}

interface TypeDefinitionState {
    shouldShowAnchor: boolean;
}

export class TypeDefinition extends React.Component<TypeDefinitionProps, TypeDefinitionState> {
    public static defaultProps: Partial<TypeDefinitionProps> = {
        shouldAddId: true,
    };
    constructor(props: TypeDefinitionProps) {
        super(props);
        this.state = {
            shouldShowAnchor: false,
        };
    }
    public render() {
        const customType = this.props.customType;
        if (!typeDocUtils.isPublicType(customType.name)) {
            return null; // no-op
        }

        let typePrefix: string;
        let codeSnippet: React.ReactNode;
        switch (customType.kindString) {
            case KindString.Interface:
                typePrefix = 'Interface';
                codeSnippet = (
                    <Interface
                        type={customType}
                    />
                );
                break;

            case KindString.Variable:
                typePrefix = 'Enum';
                codeSnippet = (
                    <CustomEnum
                        type={customType}
                    />
                );
                break;

            case KindString.Enumeration:
                typePrefix = 'Enum';
                const enumValues = _.map(customType.children, (c: CustomTypeChild) => {
                    return {
                        name: c.name,
                        defaultValue: c.defaultValue,
                    };
                });
                codeSnippet = (
                    <Enum
                        values={enumValues}
                    />
                );
                break;

            case KindString['Type alias']:
                typePrefix = 'Type Alias';
                codeSnippet = (
                    <span>
                        <span style={{color: KEYWORD_COLOR}}>type</span> {customType.name} ={' '}
                        {customType.type.typeDocType !== TypeDocTypes.Reflection ?
                            <Type type={customType.type} /> :
                            <MethodSignature
                                method={customType.type.method}
                                shouldHideMethodName={true}
                                shouldUseArrowSyntax={true}
                            />
                        }
                    </span>
                );
                break;

            default:
                throw utils.spawnSwitchErr('type.kindString', customType.kindString);
        }

        const typeDefinitionAnchorId = customType.name;
        return (
            <div
                id={this.props.shouldAddId ? typeDefinitionAnchorId : ''}
                className="pb2"
                style={{overflow: 'hidden', width: '100%'}}
                onMouseOver={this.setAnchorVisibility.bind(this, true)}
                onMouseOut={this.setAnchorVisibility.bind(this, false)}
            >
                <AnchorTitle
                    headerSize={HeaderSizes.H3}
                    title={`${typePrefix} ${customType.name}`}
                    id={this.props.shouldAddId ? typeDefinitionAnchorId : ''}
                    shouldShowAnchor={this.state.shouldShowAnchor}
                />
                <div style={{fontSize: 16}}>
                    <pre>
                        <code className="hljs">
                            {codeSnippet}
                        </code>
                    </pre>
                </div>
                {customType.comment &&
                    <Comment
                        comment={customType.comment}
                        className="py2"
                    />
                }
            </div>
        );
    }
    private setAnchorVisibility(shouldShowAnchor: boolean) {
        this.setState({
            shouldShowAnchor,
        });
    }
}
