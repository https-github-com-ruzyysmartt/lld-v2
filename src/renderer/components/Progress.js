// @flow
import React, { Component } from "react";
import styled, { keyframes } from "styled-components";
import type { ThemedComponent } from "~/renderer/styles/StyleProvider";

import Box from "~/renderer/components/Box";

const inifiteAnimation = keyframes`
  0% {
    left: -18%;
    width: 20%;
  }

  50% {
    left: 98%;
  }

  100% {
    left: -18%;
    width: 20%;
  }
`;

const fillInAnimation = keyframes`
  0% {
    transform: translate3d(-110%, 0, 0);
  }
  50% {
    transform: translate3d(-30%, 0, 0);
  }
  100% {
    transform: translate3d(0);
  }
`;

const Bar: ThemedComponent<{}> = styled(Box).attrs(() => ({
  color: "palette.divider",
  borderRadius: "2.5px",
}))`
  height: 5px;
  width: 100%;
  position: relative;
  background-color: currentColor;
  overflow: hidden;
`;

const Progression: ThemedComponent<{ infinite?: boolean }> = styled(Bar).attrs(() => ({
  color: "wallet",
}))`
  position: absolute;
  top: 0;
  left: 0;
  ${p =>
    p.infinite
      ? `
    animation: ${p.timing}ms ${
          // $FlowFixMe
          inifiteAnimation
        } infinite;
    `
      : `
    animation: ${p.timing}ms ${
          // $FlowFixMe
          fillInAnimation
        } ease-out;
    animation-fill-mode: forwards;
  `};
`;

type Props = {
  infinite: boolean,
  timing?: number,
  color?: string,
};

type State = {};

class Progress extends Component<Props, State> {
  static defaultProps = {
    infinite: false,
    timing: 2500,
    color: "wallet",
  };

  render() {
    const { infinite, color, timing } = this.props;
    const styles = infinite ? { width: "0%" } : { width: "100%" };
    return (
      <Bar>
        <Progression infinite={infinite} color={color} style={styles} timing={timing} />
      </Bar>
    );
  }
}

export default Progress;
