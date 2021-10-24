import React, { FC } from "react";
import { renderHook } from "@testing-library/react-hooks";
// Internal
import { AllConcreteStatusesFragment } from "../allConcreteStatusesGQL";
import {
  generateResultData,
  generateLoadSummaryData,
} from "../__test__/generate-test-data";
import useChartData from "./useChartData";
import { RefLine, RefArea } from "./Charts";
import { AdmixChartData } from "./Charts/AdmixtureAdditions";
import { DrumSpeedChartData } from "./Charts/DrumSpeed";
import { LoadTempChartData } from "./Charts/LoadTemp";
import { SlumpChartData } from "./Charts/SlumpTarget";
import { TotalRevsChartData } from "./Charts/TotalRevolutions";
import { WaterChartData } from "./Charts/WaterAdditions";

const data: AllConcreteStatusesFragment[] = [];

beforeEach(() => {
  data.splice(0);
  data.push(...generateResultData());
});

const Wrapper: FC = ({ children }) => <>{children}</>;

it.each`
  chartDataArr                   | value
  ${"admixAdditionsChartData"}   | ${{ elapsedSeconds: 0, maxAdmix: "84.0", admixAdded: "1.0" }}
  ${"drumSpeedChartData"}        | ${{ elapsedSeconds: 0, drumSpeed: 14 }}
  ${"loadTempChartData"}         | ${{ elapsedSeconds: 0, loadTemp: 25 }}
  ${"slumpTargetChartData"}      | ${{ elapsedSeconds: 0, actualSlump: "9.50", targetSlump: "--" }}
  ${"totalRevolutionsChartData"} | ${{ elapsedSeconds: 0, totalRevs: 503 }}
  ${"waterAdditionsChartData"}   | ${{ elapsedSeconds: 0, maxWater: "7.0", waterAdded: "1.0" }}
`("should get $chartDataArr", ({ chartDataArr, value }: ChartDataProps) => {
  const { result } = renderHook(
    () => useChartData(data.slice(0, 1), generateLoadSummaryData()),
    {
      wrapper: Wrapper,
    },
  );
  const [values] = result.current.chartData[chartDataArr];
  expect(values).toEqual(value);
});

it("Should not round metric slump", () => {
  data.splice(0);
  data.push(
    ...generateResultData([
      {
        status: "LEFT_PLANT",
        ageMinutes: 3,
        currentSlump: {
          value: 88,
          unit: "mm",
        },
      },
    ]),
  );

  const { result } = renderHook(
    () => useChartData(data, generateLoadSummaryData()),
    {
      wrapper: Wrapper,
    },
  );
  const [value] = result.current.chartData.slumpTargetChartData;
  expect(value).toEqual({
    elapsedSeconds: 0,
    actualSlump: 88,
    targetSlump: "--",
  });
});

it("Should provide data sets of the same length so that the charts line up", () => {
  data.push(
    ...generateResultData([
      {
        totalRevs: null,
        currentRPM: null,
      },
    ]),
  );
  const { result } = renderHook(
    () => useChartData(data, generateLoadSummaryData()),
    {
      wrapper: Wrapper,
    },
  );
  const { chartData } = result.current;
  const slumpLength = chartData.slumpTargetChartData.length;
  const totalRevsLength = chartData.totalRevolutionsChartData.length;
  const currentRpmLength = chartData.totalRevolutionsChartData.length;
  expect(totalRevsLength).toEqual(slumpLength);
  expect(currentRpmLength).toEqual(slumpLength);
});

const referenceLines = [
  { x: 240, label: "L\u00A0P" },
  { x: 1380, label: "A\u00A0S" },
  { x: 2880, label: "B\u00A0P" },
  { x: 3120, label: "B\u00A0P" },
  { x: 5280, label: "L\u00A0S" },
  { x: 6360, label: "B\u00A0P" },
];

const referenceAreas = [
  { x1: 2880, x2: 2940 },
  { x1: 3120, x2: 4140 },
  { x1: 6360, x2: 6420 },
];

it.each`
  referenceData       | value
  ${"referenceLines"} | ${referenceLines}
  ${"referenceAreas"} | ${referenceAreas}
`(
  "should get $referenceData",
  ({ referenceData, value }: ReferenceDataProps) => {
    const { result } = renderHook(
      () => useChartData(data, generateLoadSummaryData()),
      {
        wrapper: Wrapper,
      },
    );
    const values = result.current[referenceData];
    expect(values).toEqual(value);
  },
);

interface ChartDataProps {
  chartDataArr:
    | "slumpTargetChartData"
    | "waterAdditionsChartData"
    | "admixAdditionsChartData"
    | "drumSpeedChartData"
    | "totalRevolutionsChartData"
    | "loadTempChartData";
  value:
    | SlumpChartData
    | WaterChartData
    | AdmixChartData
    | DrumSpeedChartData
    | TotalRevsChartData
    | LoadTempChartData;
}

interface ReferenceDataProps {
  referenceData: "referenceLines" | "referenceAreas";
  value: RefLine | RefArea | string;
}
