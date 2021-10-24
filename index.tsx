import React, { useContext } from "react";
import { differenceInSeconds } from "date-fns";
import Box from "@material-ui/core/Box";
// Internal
import { AccountContext } from "@vitm/components";
import { LoadReportsQuery } from "../allConcreteStatusesGQL";
import { getOneDecimalRounding } from "../../../common/OneDecimalRounding";
import { getSlumpUnitRounding } from "../../../common/SlumpRounding";
import { RefLine, RefArea } from "./Charts";
import ChartMaker from "./ChartMaker";
import AdmixtureAdditions, {
  AdmixChartData,
} from "./Charts/AdmixtureAdditions";
import DrumSpeed, { DrumSpeedChartData } from "./Charts/DrumSpeed";
import LoadTemp, { LoadTempChartData } from "./Charts/LoadTemp";
import SlumpTargetChart, { SlumpChartData } from "./Charts/SlumpTarget";
import TotalRevolutions, {
  TotalRevsChartData,
} from "./Charts/TotalRevolutions";
import WaterAdditions, { WaterChartData } from "./Charts/WaterAdditions";

export const getInstructions = (
  loadInstructions: LoadLifecycleProps["instructions"],
) => ({
  maxAdmixValue: getOneDecimalRounding(
    loadInstructions[0]?.instructionMaxAdmix?.value,
  ),
  maxWaterValue: getOneDecimalRounding(
    loadInstructions[0]?.instructionMaxWater?.value,
  ),
});

// NOTE exported for testing
export const getChartData = (
  data: LoadReportsQuery["allConcreteStatuses"],
  instructions: LoadReportsQuery["localLoadSummaries"],
) => {
  const slumpTargetChartData: SlumpChartData[] = [];
  const waterAdditionsChartData: WaterChartData[] = [];
  const admixAdditionsChartData: AdmixChartData[] = [];
  const drumSpeedChartData: DrumSpeedChartData[] = [];
  const loadTempChartData: LoadTempChartData[] = [];
  const totalRevolutionsChartData: TotalRevsChartData[] = [];
  const referenceAreas: RefArea[] = [];
  const referenceLines: RefLine[] = [];

  let areaStart: number | undefined;

  // NOTE statusTime/startTime should never actually be undefined - limitation of graphql-engine
  const startTime = data[0]?.statusTime;

  const { maxAdmixValue, maxWaterValue } = getInstructions(instructions);

  data.forEach(
    ({
      statusTime,
      status,
      currentSlump,
      targetSlump,
      totalWaterAdded,
      totalAdmixAdded,
      slumpDisplay,
      currentRPM,
      totalRevs,
      concreteTemperature,
    }) => {
      const elapsedSeconds =
        (startTime &&
          statusTime &&
          differenceInSeconds(new Date(statusTime), new Date(startTime))) ||
        0;
      // NOTE Chart Data
      slumpTargetChartData.push({
        elapsedSeconds,
        actualSlump: getSlumpUnitRounding(currentSlump, slumpDisplay),
        targetSlump: getSlumpUnitRounding(targetSlump, "DISPLAY"),
      });
      waterAdditionsChartData.push({
        elapsedSeconds,
        waterAdded: getOneDecimalRounding(totalWaterAdded?.value),
        maxWater: maxWaterValue,
      });
      admixAdditionsChartData.push({
        elapsedSeconds,
        admixAdded: getOneDecimalRounding(totalAdmixAdded?.value),
        maxAdmix: maxAdmixValue,
      });
      drumSpeedChartData.push({
        elapsedSeconds,
        drumSpeed: currentRPM,
      });
      totalRevolutionsChartData.push({
        elapsedSeconds,
        totalRevs,
      });
      loadTempChartData.push({
        elapsedSeconds,
        loadTemp: concreteTemperature?.value,
      });

      // NOTE to calculate area we need to find a status with BEGIN_POUR for x1
      // and then we need to find a status of END_POUR or PAUSE_POUR for x2
      // but since these are different items in the array we need to keep track of x1 until we find x2
      if (status === "LEFT_PLANT") {
        referenceLines.push({ x: elapsedSeconds, label: "L\u00A0P" });
      }
      if (status === "ARRIVE_SITE_BUTTON") {
        referenceLines.push({ x: elapsedSeconds, label: "A\u00A0S" });
      }
      if (status === "BEGIN_POUR") {
        referenceLines.push({ x: elapsedSeconds, label: "B\u00A0P" });
        areaStart = elapsedSeconds;
      }
      if (status === "LEFT_JOB_SITE") {
        referenceLines.push({ x: elapsedSeconds, label: "L\u00A0S" });
      }
      if ((status === "END_POUR" || status === "PAUSE_POUR") && !!areaStart) {
        referenceAreas.push({ x1: areaStart, x2: elapsedSeconds });
        areaStart = undefined;
      }
    },
  );

  return {
    chartData: {
      slumpTargetChartData,
      waterAdditionsChartData,
      admixAdditionsChartData,
      drumSpeedChartData,
      totalRevolutionsChartData,
      loadTempChartData,
    },
    referenceLines,
    referenceAreas,
  };
};

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
  } = getChartData(data, instructions);

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
