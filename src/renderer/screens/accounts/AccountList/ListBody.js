// @flow

import React from "react";
import type { AccountLike, Account, PortfolioRange } from "@ledgerhq/live-common/lib/types";
import Box from "~/renderer/components/Box";
import AccountItem from "../AccountRowItem";
import AccountItemPlaceholder from "../AccountRowItem/Placeholder";

type Props = {
  visibleAccounts: Account[],
  hiddenAccounts: Account[],
  onAccountClick: AccountLike => void,
  lookupParentAccount: (id: string) => ?Account,
  range: PortfolioRange,
  showNewAccount: boolean,
  search?: string,
};

const ListBody = ({
  visibleAccounts,
  showNewAccount,
  hiddenAccounts,
  range,
  onAccountClick,
  lookupParentAccount,
  search,
}: Props) => (
  <Box>
    {visibleAccounts.map(account => (
      <AccountItem
        key={account.id}
        account={account}
        search={search}
        parentAccount={account.type !== "Account" ? lookupParentAccount(account.parentId) : null}
        range={range}
        onClick={onAccountClick}
      />
    ))}
    {showNewAccount ? <AccountItemPlaceholder /> : null}
    {hiddenAccounts.map(account => (
      <AccountItem
        hidden
        key={account.id}
        account={account}
        search={search}
        parentAccount={account.type !== "Account" ? lookupParentAccount(account.parentId) : null}
        range={range}
        onClick={onAccountClick}
      />
    ))}
  </Box>
);

export default React.memo<Props>(ListBody);
