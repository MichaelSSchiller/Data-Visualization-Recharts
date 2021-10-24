import React from "react";
import { LegendProps } from "recharts";
import useTheme from "@material-ui/core/styles/useTheme";
// Internal
import { VitmAllConcreteStatus } from "../../../../../graphqlTypes";
import Charts, { ChartDataProps, BaseChartData } from ".";

export default ({ ...chartProps }: ChartDataProps<TotalRevsChartData>) => {
  const {
    palette: {
      loadDetailColor: { totalRevs },
    },
  } = useTheme();

  const lines = [
    {
      dataKey: "totalRevs",
      name: "Total Revs",
      color: totalRevs,
    },
  ];

  const legendPayload: LegendProps["payload"] = [
    {
      value: `Total Revs`,
      type: "circle",
      color: totalRevs,
      id: "totalRevs",
    },
  ];

  return (
    <Charts<TotalRevsChartData>
      {...chartProps}
      lines={lines}
      legendPayload={legendPayload}
    />
  );
};

export interface TotalRevsChartData
  extends BaseChartData,
    Record<string, unknown> {
  totalRevs?: VitmAllConcreteStatus["totalRevs"];
}
