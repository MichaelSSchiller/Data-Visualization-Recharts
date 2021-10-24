import React from "react";
import { LegendProps } from "recharts";
import useTheme from "@material-ui/core/styles/useTheme";
// Internal
import { DisplayUnits } from "@vitm/components";
import { Scalars } from "../../../../../graphqlTypes";
import Charts, { ChartDataProps, BaseChartData } from ".";

export default ({ units, ...chartProps }: LoadTempChartProps) => {
  const {
    palette: {
      loadDetailColor: { loadTemp },
    },
  } = useTheme();

  const unit = units ? `(${units})` : "";
  const lines = [
    {
      dataKey: "loadTemp",
      name: `Temp ${unit}`,
      color: loadTemp,
    },
  ];

  const legendPayload: LegendProps["payload"] = [
    {
      value: `Temperature ${unit}`,
      type: "circle",
      color: loadTemp,
      id: "loadTemp",
    },
  ];

  return (
    <Charts<LoadTempChartData>
      {...chartProps}
      lines={lines}
      legendPayload={legendPayload}
    />
  );
};

interface LoadTempChartProps extends ChartDataProps<LoadTempChartData> {
  units: DisplayUnits["temperatureUnit"];
}

export interface LoadTempChartData
  extends BaseChartData,
    Record<string, unknown> {
  loadTemp?: Scalars["local_temperature"]["value"];
}
