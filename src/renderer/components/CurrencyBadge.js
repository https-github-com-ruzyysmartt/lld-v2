// @flow

import React from "react";
import styled from "styled-components";
import { getCryptoCurrencyIcon } from "@ledgerhq/live-common/lib/react";
import type { CryptoCurrency, TokenCurrency } from "@ledgerhq/live-common/lib/types";
import { rgba } from "~/renderer/styles/helpers";
import IconCheck from "~/renderer/icons/Check";
import Box from "~/renderer/components/Box";
import ParentCryptoCurrencyIcon from "~/renderer/components/ParentCryptoCurrencyIcon";
import useTheme from "~/renderer/hooks/useTheme";
import ensureContrast from "~/renderer/ensureContrast";
import type { ThemedComponent } from "~/renderer/styles/StyleProvider";
import Spinner from "./Spinner";

const CryptoIconWrapper: ThemedComponent<{
  cryptoColor: string,
}> = styled(Box).attrs(p => ({
  alignItems: "center",
  justifyContent: "center",
  bg: rgba(p.cryptoColor, 0.1),
  color: p.cryptoColor,
}))`
  border-radius: ${p => p.borderRadius || "50%"};
  width: ${p => p.size || 40}px;
  height: ${p => p.size || 40}px;
  position: relative;

  & > :nth-child(2) {
    background: ${p =>
      p.showCheckmark ? p.theme.colors.positiveGreen : "palette.background.paper"};
    border-radius: 100%;
    padding: 2px;
    position: absolute;
    right: -8px;
    top: -8px;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    & > svg {
      width: 14px;
    }
  }
`;

export function CurrencyCircleIcon({
  currency,
  size,
  showSpinner,
  showCheckmark,
}: {
  currency: CryptoCurrency | TokenCurrency,
  size: number,
  showSpinner?: boolean,
  showCheckmark?: boolean,
}) {
  const bgColor = useTheme("colors.palette.background.paper");
  if (currency.type === "TokenCurrency") {
    return <ParentCryptoCurrencyIcon currency={currency} bigger />;
  }
  const Icon = getCryptoCurrencyIcon(currency);
  return (
    <CryptoIconWrapper
      size={size}
      showCheckmark={showCheckmark}
      cryptoColor={ensureContrast(currency.color, bgColor)}
    >
      {Icon && <Icon size={size / 2} />}
      {showCheckmark && (
        <div>
          <IconCheck color="palette.background.paper" size={16} />
        </div>
      )}
      {showSpinner && <Spinner color="palette.text.shade60" size={14} />}
    </CryptoIconWrapper>
  );
}

function CurrencyBadge({ currency }: { currency: CryptoCurrency | TokenCurrency }) {
  return (
    <Box horizontal flow={3}>
      <CurrencyCircleIcon size={40} currency={currency} />
      <Box>
        <Box
          ff="Inter|ExtraBold"
          color="palette.text.shade100"
          fontSize={2}
          style={{ letterSpacing: 2 }}
        >
          {currency.ticker}
        </Box>
        <Box ff="Inter" color="palette.text.shade100" fontSize={5} data-e2e="currencyBadge">
          {currency.name}
        </Box>
      </Box>
    </Box>
  );
}

export default CurrencyBadge;
