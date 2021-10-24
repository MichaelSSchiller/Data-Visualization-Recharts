import React from "react";
import { LegendProps, YAxisProps } from "recharts";
import useTheme from "@material-ui/core/styles/useTheme";
// Internal
import { DisplayUnits, UNITS } from "@vitm/components";
import { Scalars } from "../../../../../graphqlTypes";
import Charts, { ChartDataProps, BaseChartData } from ".";

const getRange = (units: WaterChartProps["units"]) => {
  switch (units) {
    case UNITS["l/m^3"]:
      return {
        yAxisRange: [0, 50] as YAxisProps["domain"],
        ticks: ["0", "10", "20", "30", "40", "50"],
      };
    case UNITS["gal/yd^3"]:
      return {
        yAxisRange: [0, 10] as YAxisProps["domain"],
        ticks: ["0", "2", "4", "6", "8", "10"],
      };
    default:
      return { yAxisRange: undefined, ticks: undefined };
  }
};

export default ({ units, ...chartProps }: WaterChartProps) => {
  const {
    palette: {
      loadDetailColor: { waterAdded, maxWater },
    },
  } = useTheme();

  const unit = units ? `(${units})` : "";
  const lines = [
    { dataKey: "waterAdded", name: `Water ${unit}`, color: waterAdded },
    {
      dataKey: "maxWater",
      name: `Allowable Water ${unit}`,
      color: maxWater,
      dot: false,
    },
  ];

  const legendPayload: LegendProps["payload"] = [
    {
      value: `Water ${unit}`,
      type: "circle",
      color: waterAdded,
      id: "waterAdded",
    },
    {
      value: "Allowable Water",
      type: "circle",
      color: maxWater,
      id: "maxWater",
    },
  ];

  const { yAxisRange, ticks } = getRange(units);

  return (
    <Charts<WaterChartData>
      {...chartProps}
      lines={lines}
      legendPayload={legendPayload}
      yAxisRange={yAxisRange}
      ticks={ticks}
    />
  );
};

interface WaterChartProps extends ChartDataProps<WaterChartData> {
  units: DisplayUnits["waterRatioUnit"];
}

export interface WaterChartData extends BaseChartData, Record<string, unknown> {
  waterAdded?: Scalars["local_water_per_load_size"]["value"] | string;
  // FIXME Get this value from the ticket
  maxWater?: string | number;
}
