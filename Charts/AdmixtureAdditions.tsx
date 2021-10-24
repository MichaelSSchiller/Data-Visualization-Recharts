import React from "react";
import { LegendProps, YAxisProps } from "recharts";
import useTheme from "@material-ui/core/styles/useTheme";
// Internal
import { DisplayUnits, UNITS } from "@vitm/components";
import { Scalars } from "../../../../../graphqlTypes";
import Charts, { ChartDataProps, BaseChartData } from ".";

const getRange = (units: AdmixChartProps["units"]) => {
  switch (units) {
    case UNITS["ml/m^3"]:
      return {
        yAxisRange: [0, 1000] as YAxisProps["domain"],
        ticks: ["0", "200", "400", "600", "800", "1000"],
      };
    case UNITS["usfloz/yd^3"]:
      return {
        yAxisRange: [0, 25] as YAxisProps["domain"],
        ticks: ["0", "5", "10", "15", "20", "25"],
      };
    default:
      return { yAxisRange: undefined, ticks: undefined };
  }
};

export default ({ units, ...chartProps }: AdmixChartProps) => {
  const {
    palette: {
      loadDetailColor: { admixture, maxWater },
    },
  } = useTheme();

  const unit = units ? `(${units})` : "";
  const lines = [
    { dataKey: "admixAdded", name: `Admixture ${unit}`, color: admixture },
    {
      dataKey: "maxAdmix",
      name: `Allowable Admix ${unit}`,
      color: maxWater,
      dot: false,
    },
  ];

  const legendPayload: LegendProps["payload"] = [
    {
      value: `Admixture ${unit}`,
      type: "circle",
      color: admixture,
      id: "admixAdded",
    },
    {
      value: "Allowable Admix",
      type: "circle",
      color: maxWater,
      id: "maxAdmix",
    },
  ];

  const { yAxisRange, ticks } = getRange(units);

  return (
    <Charts<AdmixChartData>
      {...chartProps}
      lines={lines}
      legendPayload={legendPayload}
      yAxisRange={yAxisRange}
      ticks={ticks}
    />
  );
};

interface AdmixChartProps extends ChartDataProps<AdmixChartData> {
  units: DisplayUnits["admixRatioUnit"];
}

export interface AdmixChartData extends BaseChartData, Record<string, unknown> {
  admixAdded?: Scalars["local_admix_per_load_size"]["value"] | string;
  maxAdmix?: number | string;
}
