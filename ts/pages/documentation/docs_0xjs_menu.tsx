import * as _ from 'lodash';
import * as React from 'react';
import MenuItem from 'material-ui/MenuItem';
import {colors} from 'material-ui/styles';
import {utils} from 'ts/utils/utils';
import {constants} from 'ts/utils/constants';
import compareVersions = require('compare-versions');
import {VersionDropDown} from 'ts/pages/documentation/version_drop_down';
import {DocSections, Styles} from 'ts/types';
import {Link as ScrollLink} from 'react-scroll';

export const menu = {
    introduction: [
        DocSections.introduction,
    ],
    install: [
        DocSections.installation,
    ],
    topics: [
        DocSections.async,
        DocSections.errors,
        DocSections.versioning,
    ],
    zeroEx: [
        DocSections.zeroEx,
    ],
    contracts: [
        DocSections.exchange,
        DocSections.token,
        DocSections.tokenRegistry,
        DocSections.etherToken,
        DocSections.proxy,
    ],
    types: [
        DocSections.types,
    ],
};

const menuSubsectionToVersionWhenIntroduced = {
    [DocSections.etherToken]: '0.7.1',
    [DocSections.proxy]: '0.8.0',
};

interface Docs0xjsMenuProps {
    shouldDisplaySectionHeaders?: boolean;
    onMenuItemClick?: () => void;
    selectedVersion: string;
    versions: string[];
}

interface Docs0xjsMenuState {}

const styles: Styles = {
    menuItemWithHeaders: {
        minHeight: 0,
    },
    menuItemWithoutHeaders: {
        minHeight: 48,
    },
    menuItemInnerDivWithHeaders: {
        lineHeight: 2,
    },
};

export class Docs0xjsMenu extends React.Component<Docs0xjsMenuProps, Docs0xjsMenuState> {
    public static defaultProps: Partial<Docs0xjsMenuProps> = {
        shouldDisplaySectionHeaders: true,
        onMenuItemClick: _.noop,
    };
    public render() {
        const finalMenu = _.cloneDeep(menu);
        finalMenu.contracts = _.filter(finalMenu.contracts, (contractName: string) => {
            const versionIntroducedIfExists = menuSubsectionToVersionWhenIntroduced[contractName];
            if (_.isUndefined(versionIntroducedIfExists)) {
                return true;
            } else {
                const isIntroducedInSelectedVersion = compareVersions(this.props.selectedVersion,
                                                                      versionIntroducedIfExists) >= 0;
                return isIntroducedInSelectedVersion;
            }
        });

        const navigation = _.map(finalMenu, (menuItems: string[], sectionName: string) => {
            if (this.props.shouldDisplaySectionHeaders) {
                return (
                    <div
                        key={`section-${sectionName}`}
                        className="py1"
                    >
                        <div
                            style={{color: colors.grey500}}
                            className="pb1"
                        >
                            {sectionName.toUpperCase()}
                        </div>
                        {this.renderMenuItems(menuItems)}
                    </div>
                );
            } else {
                return (
                    <div key={`section-${sectionName}`} >
                        {this.renderMenuItems(menuItems)}
                    </div>
                );
            }
        });
        return (
            <div>
                {!_.isUndefined(this.props.versions) &&
                 !_.isUndefined(this.props.selectedVersion) &&
                    <VersionDropDown
                        selectedVersion={this.props.selectedVersion}
                        versions={this.props.versions}
                    />
                }
                {navigation}
            </div>
        );
    }
    private renderMenuItems(menuItemNames: string[]) {
        const menuItemStyles = this.props.shouldDisplaySectionHeaders ?
                                    styles.menuItemWithHeaders :
                                    styles.menuItemWithoutHeaders;
        const menuItemInnerDivStyles = this.props.shouldDisplaySectionHeaders ?
                                    styles.menuItemInnerDivWithHeaders : {};
        const menuItems = _.map(menuItemNames, menuItemName => {
            return (
                <ScrollLink
                    key={`menuItem-${menuItemName}`}
                    to={menuItemName}
                    offset={0}
                    duration={constants.DOCS_SCROLL_DURATION_MS}
                    containerId={constants.DOCS_CONTAINER_ID}
                >
                    <MenuItem
                        onTouchTap={this.onMenuItemClick.bind(this, menuItemName)}
                        style={menuItemStyles}
                        innerDivStyle={menuItemInnerDivStyles}
                    >
                        <span style={{textTransform: 'capitalize'}}>
                            {menuItemName}
                        </span>
                    </MenuItem>
                </ScrollLink>
            );
        });
        return menuItems;
    }
    private onMenuItemClick(menuItemName: string) {
        utils.setUrlHash(menuItemName);
        this.props.onMenuItemClick();
    }
}
