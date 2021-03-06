// @flow

import React, { PureComponent } from "react";
import type { PortfolioRange } from "@ledgerhq/live-common/lib/types/portfolio";
import { listSubAccounts } from "@ledgerhq/live-common/lib/account/helpers";
import { listTokenTypesForCryptoCurrency } from "@ledgerhq/live-common/lib/currencies";
import styled from "styled-components";
import { Trans, withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { compose } from "redux";
import type { Account, AccountLike } from "@ledgerhq/live-common/lib/types/account";
import { openModal } from "~/renderer/actions/modals";
import Box from "~/renderer/components/Box";
import Text from "~/renderer/components/Text";
import type { T } from "~/types/common";
import IconPlus from "~/renderer/icons/Plus";
import TokenRow from "~/renderer/components/TokenRow";
import Button from "~/renderer/components/Button";
import { urls } from "~/config/urls";
import LabelWithExternalIcon from "~/renderer/components/LabelWithExternalIcon";
import { openURL } from "~/renderer/linking";
import { track } from "~/renderer/analytics/segment";
import AccountContextMenu from "~/renderer/components/ContextMenu/AccountContextMenu";
import type { ThemedComponent } from "~/renderer/styles/StyleProvider";

type OwnProps = {
  account: Account,
  range: PortfolioRange,
};

type Props = {
  ...OwnProps,
  t: T,
  openModal: Function,
  router: any,
};

const Wrapper: ThemedComponent<{}> = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const EmptyState: ThemedComponent<{}> = styled.div`
  border: 1px dashed ${p => p.theme.colors.palette.text.shade60};
  padding: 15px 20px;
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  > :first-child {
    flex: 1;
  }
  > :nth-child(2) {
    align-self: center;
  }
`;

const Placeholder: ThemedComponent<{}> = styled.div`
  flex-direction: column;
  display: flex;
  padding-right: 50px;
`;

const mapDispatchToProps = {
  openModal,
};

// Fixme Temporarily hiding the receive token button
const ReceiveButton = (props: { onClick: () => void }) => (
  <Button small primary onClick={props.onClick}>
    <Box horizontal flow={1} alignItems="center">
      <IconPlus size={12} />
      <Box>
        <Trans i18nKey="tokensList.cta" />
      </Box>
    </Box>
  </Button>
);

class TokensList extends PureComponent<Props> {
  onAccountClick = (account: AccountLike, parentAccount: Account) => {
    this.props.router.push(`/account/${parentAccount.id}/${account.id}`);
  };

  onReceiveClick = () => {
    const { account, openModal } = this.props;
    openModal("MODAL_RECEIVE", { account, receiveTokenMode: true });
  };

  render() {
    const { account, t, range } = this.props;
    if (!account.subAccounts) return null;
    const subAccounts = listSubAccounts(account);
    const isTokenAccount = listTokenTypesForCryptoCurrency(account.currency).length > 0;
    const isEmpty = subAccounts.length === 0;

    if (!isTokenAccount && isEmpty) return null;

    return (
      <Box mb={50}>
        <Wrapper>
          <Text color="palette.text.shade100" mb={2} ff="Inter|Medium" fontSize={6}>
            {isTokenAccount ? t("tokensList.title") : t("subAccounts.title")}
          </Text>
          {!isEmpty && isTokenAccount && <ReceiveButton onClick={this.onReceiveClick} />}
        </Wrapper>
        {isEmpty && (
          <EmptyState>
            <Placeholder>
              <Text color="palette.text.shade80" ff="Inter|SemiBold" fontSize={4}>
                <Trans i18nKey={"tokensList.placeholder"} />{" "}
                <LabelWithExternalIcon
                  color="wallet"
                  ff="Inter|SemiBold"
                  onClick={() => {
                    openURL(urls.managerERC20);
                    track("More info on Manage ERC20 tokens");
                  }}
                  label={t("tokensList.link")}
                />
              </Text>
            </Placeholder>
            <ReceiveButton onClick={this.onReceiveClick} />
          </EmptyState>
        )}
        {subAccounts.map((token, index) => (
          <AccountContextMenu key={token.id} account={token} parentAccount={account}>
            <TokenRow
              index={index}
              range={range}
              account={token}
              parentAccount={account}
              onClick={this.onAccountClick}
              disableRounding
            />
          </AccountContextMenu>
        ))}
      </Box>
    );
  }
}

const ConnectedTokenList: React$ComponentType<OwnProps> = compose(
  connect(null, mapDispatchToProps),
  withTranslation(),
  withRouter,
)(TokensList);

export default ConnectedTokenList;
