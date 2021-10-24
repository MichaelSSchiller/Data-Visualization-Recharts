import React from "react";
import { LegendProps, YAxisProps } from "recharts";
import useTheme from "@material-ui/core/styles/useTheme";
// Internal
import { DisplayUnits } from "@vitm/components";
import Charts, { ChartDataProps, BaseChartData } from ".";

const getRange = (units: SlumpChartProps["units"]) => {
  switch (units) {
    case "in":
      return {
        yAxisRange: [0, 10] as YAxisProps["domain"],
        ticks: ["0", "2", "4", "6", "8", "10"],
      };
    case "mm":
      return {
        yAxisRange: [0, 250] as YAxisProps["domain"],
        ticks: ["0", "50", "100", "150", "200", "250"],
      };
    case "cm":
      return {
        yAxisRange: [0, 25] as YAxisProps["domain"],
        ticks: ["0", "5", "10", "15", "20", "25"],
      };
    default:
      return { yAxisRange: undefined, ticks: undefined };
  }
};

export default ({ units, ...chartProps }: SlumpChartProps) => {
  const {
    palette: {
      loadDetailColor: { actualSlump, targetSlump },
    },
  } = useTheme();

  const lines = [
    {
      dataKey: "actualSlump",
      name: `Actual Slump (${units})`,
      color: actualSlump,
    },
    {
      dataKey: "targetSlump",
      name: `Target Slump (${units})`,
      color: targetSlump,
    },
  ];

  const legendPayload: LegendProps["payload"] = [
    {
      value: `Actual Slump (${units})`,
      type: "circle",
      color: actualSlump,
      id: "actualSlump",
    },
    {
      value: `Target Slump (${units})`,
      type: "circle",
      color: targetSlump,
      id: "targetSlump",
    },
  ];

  const { yAxisRange, ticks } = getRange(units);

  return (
    <Charts<SlumpChartData>
      {...chartProps}
      lines={lines}
      legendPayload={legendPayload}
      yAxisRange={yAxisRange}
      ticks={ticks}
    />
  );
};

interface SlumpChartProps extends ChartDataProps<SlumpChartData> {
  units: DisplayUnits["slumpUnit"];
}

export interface SlumpChartData extends BaseChartData, Record<string, unknown> {
  actualSlump?: number | string;
  targetSlump?: number | string;
}
