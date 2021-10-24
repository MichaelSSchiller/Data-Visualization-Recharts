import React, { useContext } from "react";
import Box from "@material-ui/core/Box";
// Internal
import { AccountContext } from "@vitm/components";
import { LoadReportsQuery } from "../allConcreteStatusesGQL";
import ChartMaker from "./ChartMaker";
import AdmixtureAdditions from "./Charts/AdmixtureAdditions";
import DrumSpeed from "./Charts/DrumSpeed";
import LoadTemp from "./Charts/LoadTemp";
import SlumpTargetChart from "./Charts/SlumpTarget";
import TotalRevolutions from "./Charts/TotalRevolutions";
import WaterAdditions from "./Charts/WaterAdditions";
import useChartData from "./useChartData";

export default ({ data, instructions }: LoadLifecycleProps) => {
  const {
    chartData: {
      slumpTargetChartData,
      waterAdditionsChartData,
      admixAdditionsChartData,
      drumSpeedChartData,
      loadTempChartData,
      totalRevolutionsChartData,
    },
    ...referenceItems
  } = useChartData(data, instructions);

  const { units } = useContext(AccountContext);

  return (
    <Box display="flex" flexDirection="column" flex={1}>
      <ChartMaker title="Slump vs. Target">
        <SlumpTargetChart
          data={slumpTargetChartData}
          units={units.slumpUnit}
          {...referenceItems}
        />
      </ChartMaker>
      <ChartMaker title="Water Additions">
        <WaterAdditions
          data={waterAdditionsChartData}
          units={units.waterRatioUnit}
          {...referenceItems}
        />
      </ChartMaker>
      <ChartMaker title="Admixture Additions">
        <AdmixtureAdditions
          data={admixAdditionsChartData}
          units={units.admixRatioUnit}
          {...referenceItems}
        />
      </ChartMaker>
      <ChartMaker title="Drum Speed">
        <DrumSpeed data={drumSpeedChartData} {...referenceItems} />
      </ChartMaker>
      <ChartMaker title="Total Revolutions">
        <TotalRevolutions
          data={totalRevolutionsChartData}
          {...referenceItems}
        />
      </ChartMaker>
      <ChartMaker title="Temperature of the Load">
        <LoadTemp
          data={loadTempChartData}
          units={units.temperatureUnit}
          {...referenceItems}
        />
      </ChartMaker>
    </Box>
  );
};

interface LoadLifecycleProps {
  data: LoadReportsQuery["allConcreteStatuses"];
  instructions: LoadReportsQuery["localLoadSummaries"];
}
