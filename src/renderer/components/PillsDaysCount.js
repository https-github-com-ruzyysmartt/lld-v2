// @flow

import React, { Fragment, PureComponent } from "react";
import { withTranslation } from "react-i18next";
import type { T } from "~/types/common";
import Pills from "~/renderer/components/Pills";
import { timeRangeDaysByKey } from "~/renderer/reducers/settings";
import type { TimeRange } from "~/renderer/reducers/settings";
import Track from "~/renderer/analytics/Track";

type Props = {|
  selected: string,
  onChange: ({ key: string, value: *, label: React$Node }) => *,
  t: T,
|};

class PillsDaysCount extends PureComponent<Props> {
  render() {
    const { selected, onChange, t } = this.props;
    return (
      <Fragment>
        <Track onUpdate event="PillsDaysChange" selected={selected} />
        <Pills
          items={Object.keys(timeRangeDaysByKey).map((key: TimeRange) => ({
            key,
            value: timeRangeDaysByKey[key],
            label: t(`time.range.${key}`),
          }))}
          activeKey={selected}
          onChange={onChange}
          bordered
        />
      </Fragment>
    );
  }
}

export default withTranslation()(PillsDaysCount);
