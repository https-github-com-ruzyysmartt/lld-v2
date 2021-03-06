// @flow

import React, { PureComponent } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { createStructuredSelector } from "reselect";
import type { Account, Operation, AccountLike } from "@ledgerhq/live-common/lib/types";
import { getMainAccount } from "@ledgerhq/live-common/lib/account";
import { getOperationAmountNumber } from "@ledgerhq/live-common/lib/operation";
import type { T } from "~/types/common";
import {
  confirmationsNbForCurrencySelector,
  marketIndicatorSelector,
} from "~/renderer/reducers/settings";
import { getMarketColor } from "~/renderer/styles/helpers";

import Box from "~/renderer/components/Box";

import ConfirmationCheck from "./ConfirmationCheck";
import type { ThemedComponent } from "~/renderer/styles/StyleProvider";

const mapStateToProps = createStructuredSelector({
  confirmationsNb: (state, { account, parentAccount }) =>
    confirmationsNbForCurrencySelector(state, {
      currency: getMainAccount(account, parentAccount).currency,
    }),
  marketIndicator: marketIndicatorSelector,
});

const Cell: ThemedComponent<{}> = styled(Box).attrs(() => ({
  pl: 4,
  horizontal: true,
  alignItems: "center",
}))``;

type OwnProps = {
  account: AccountLike,
  parentAccount?: Account,
  t: T,
  operation: Operation,
};

type Props = {
  ...OwnProps,
  confirmationsNb: number,
  marketIndicator: string,
};

class ConfirmationCell extends PureComponent<Props> {
  render() {
    const { account, parentAccount, confirmationsNb, t, operation, marketIndicator } = this.props;
    const mainAccount = getMainAccount(account, parentAccount);

    const amount = getOperationAmountNumber(operation);

    const isNegative = amount.isNegative();

    const isConfirmed =
      (operation.blockHeight ? mainAccount.blockHeight - operation.blockHeight : 0) >
      confirmationsNb;

    const marketColor = getMarketColor({
      marketIndicator,
      isNegative,
    });

    return (
      <Cell alignItems="center" justifyContent="flex-start">
        <ConfirmationCheck
          type={operation.type}
          isConfirmed={isConfirmed}
          marketColor={marketColor}
          hasFailed={operation.hasFailed}
          t={t}
        />
      </Cell>
    );
  }
}

const ConnectedConfirmationCell: React$ComponentType<OwnProps> = connect(mapStateToProps)(
  ConfirmationCell,
);

export default ConnectedConfirmationCell;
