import React from "react";
import { LegendProps } from "recharts";
import useTheme from "@material-ui/core/styles/useTheme";
// Internal
import { VitmAllConcreteStatus } from "../../../../../graphqlTypes";
import Charts, { ChartDataProps, BaseChartData } from ".";

export default ({ ...chartProps }: ChartDataProps<DrumSpeedChartData>) => {
  const {
    palette: {
      loadDetailColor: { drumSpeed },
    },
  } = useTheme();

  const lines = [
    {
      dataKey: "drumSpeed",
      name: `Drum Speed (rpm)`,
      color: drumSpeed,
    },
  ];

  const legendPayload: LegendProps["payload"] = [
    {
      value: `Drum Speed (rpm)`,
      type: "circle",
      color: drumSpeed,
      id: "drumSpeed",
    },
  ];

  return (
    <Charts<DrumSpeedChartData>
      {...chartProps}
      lines={lines}
      legendPayload={legendPayload}
    />
  );
};

export interface DrumSpeedChartData
  extends BaseChartData,
    Record<string, unknown> {
  drumSpeed?: VitmAllConcreteStatus["currentRPM"];
}
