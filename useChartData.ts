import { differenceInSeconds } from "date-fns";
// Internal
import { LoadReportsQuery } from "../allConcreteStatusesGQL";
import { getOneDecimalRounding } from "../../../common/OneDecimalRounding";
import { getSlumpUnitRounding } from "../../../common/SlumpRounding";
import { RefLine, RefArea } from "./Charts";
import { AdmixChartData } from "./Charts/AdmixtureAdditions";
import { DrumSpeedChartData } from "./Charts/DrumSpeed";
import { LoadTempChartData } from "./Charts/LoadTemp";
import { SlumpChartData } from "./Charts/SlumpTarget";
import { TotalRevsChartData } from "./Charts/TotalRevolutions";
import { WaterChartData } from "./Charts/WaterAdditions";

export const getInstructions = (
  instructions: LoadReportsQuery["localLoadSummaries"],
) => ({
  maxAdmixValue: getOneDecimalRounding(
    instructions[0]?.instructionMaxAdmix?.value,
  ),
  maxWaterValue: getOneDecimalRounding(
    instructions[0]?.instructionMaxWater?.value,
  ),
});

export default (
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
