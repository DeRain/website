import * as _ from 'lodash';
import * as React from 'react';
import {constants} from 'ts/utils/constants';
import {utils} from 'ts/utils/utils';
import {Event, EventArg, HeaderSizes} from 'ts/types';
import {Type} from 'ts/pages/documentation/type';
import {AnchorTitle} from 'ts/pages/shared/anchor_title';

const KEYWORD_COLOR = '#a81ca6';
const CUSTOM_GREEN = 'rgb(77, 162, 75)';

interface EventDefinitionProps {
    event: Event;
}

interface EventDefinitionState {
    shouldShowAnchor: boolean;
}

export class EventDefinition extends React.Component<EventDefinitionProps, EventDefinitionState> {
    constructor(props: EventDefinitionProps) {
        super(props);
        this.state = {
            shouldShowAnchor: false,
        };
    }
    public render() {
        const event = this.props.event;
        return (
            <div
                id={event.name}
                className="pb2"
                style={{overflow: 'hidden', width: '100%'}}
                onMouseOver={this.setAnchorVisibility.bind(this, true)}
                onMouseOut={this.setAnchorVisibility.bind(this, false)}
            >
                <AnchorTitle
                    headerSize={HeaderSizes.H3}
                    title={`Event ${event.name}`}
                    id={event.name}
                    shouldShowAnchor={this.state.shouldShowAnchor}
                />
                <div style={{fontSize: 16}}>
                    <pre>
                        <code className="hljs">
                            {this.renderEventCode()}
                        </code>
                    </pre>
                </div>
            </div>
        );
    }
    private renderEventCode() {
        const indexed = <span style={{color: CUSTOM_GREEN}}> indexed</span>;
        const eventArgs = _.map(this.props.event.eventArgs, (eventArg: EventArg) => {
            return (
                <span key={`eventArg-${eventArg.name}`}>
                    {eventArg.name}{eventArg.isIndexed ? indexed : ''}:  <Type type={eventArg.type} />,
                </span>
            );
        });
        const argList = _.reduce(eventArgs, (prev: React.ReactNode, curr: React.ReactNode) => {
            return [prev, '\n\t', curr];
        });
        return (
            <span>
                {`{`}
                    <br />
                    {'\t'}{argList}
                    <br />
                {`}`}
            </span>
        );
    }
    private setAnchorVisibility(shouldShowAnchor: boolean) {
        this.setState({
            shouldShowAnchor,
        });
    }
}
