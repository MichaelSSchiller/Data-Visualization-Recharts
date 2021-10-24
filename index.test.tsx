import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import { theme } from "@vitm/components";
import {
  AllConcreteStatusesFragment,
  LocalLoadSummaryFragment,
} from "../allConcreteStatusesGQL";
import {
  generateResultData,
  generateLoadSummaryData,
} from "../__test__/generate-test-data";
import LoadLifeCycle, { getChartData } from ".";
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

const renderLoadHistory = (
  instructions: LocalLoadSummaryFragment[] = generateLoadSummaryData(),
) =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <LoadLifeCycle data={data.slice(0, 1)} instructions={instructions} />
      </MemoryRouter>
    </ThemeProvider>,
  );

it("should render Load Life Cycle even if no load summary data is present ", () => {
  const { getByText } = renderLoadHistory([][0]);
  expect(getByText("Slump vs. Target")).toBeInTheDocument();
  expect(getByText("Water Additions")).toBeInTheDocument();
  expect(getByText("Admixture Additions")).toBeInTheDocument();
});

it("should render AdmixtureAdditions", () => {
  const { getByText } = renderLoadHistory();
  expect(getByText("Admixture Additions")).toBeInTheDocument();
});

it("should render DrumSpeed", () => {
  const { getByText } = renderLoadHistory();
  expect(getByText("Drum Speed")).toBeInTheDocument();
});

it("should render LoadTemp", () => {
  const { getByText } = renderLoadHistory();
  expect(getByText("Temperature of the Load")).toBeInTheDocument();
});

it("should render SlumpTarget", () => {
  const { getByText } = renderLoadHistory();
  expect(getByText("Slump vs. Target")).toBeInTheDocument();
});

it("should render TotalRevolutions", () => {
  const { getByText } = renderLoadHistory();
  expect(getByText("Total Revolutions")).toBeInTheDocument();
});

it("should render WaterAdditions", () => {
  const { getByText } = renderLoadHistory();
  expect(getByText("Water Additions")).toBeInTheDocument();
});

// NOTE reference values are for the stauses genereted from arrayOfStatuses
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

describe("getChartData()", () => {
  it.each`
    chartDataArr                   | value
    ${"admixAdditionsChartData"}   | ${{ elapsedSeconds: 0, maxAdmix: "84.0", admixAdded: "1.0" }}
    ${"drumSpeedChartData"}        | ${{ elapsedSeconds: 0, drumSpeed: 14 }}
    ${"loadTempChartData"}         | ${{ elapsedSeconds: 0, loadTemp: 25 }}
    ${"slumpTargetChartData"}      | ${{ elapsedSeconds: 0, actualSlump: "9.50", targetSlump: "--" }}
    ${"totalRevolutionsChartData"} | ${{ elapsedSeconds: 0, totalRevs: 503 }}
    ${"waterAdditionsChartData"}   | ${{ elapsedSeconds: 0, maxWater: "7.0", waterAdded: "1.0" }}
  `(
    "should get $chartDataArr",
    ({ chartDataArr, value }: GetChartDataProps) => {
      const { chartData } = getChartData(
        data.slice(0, 1),
        generateLoadSummaryData(),
      );
      const [values] = chartData[chartDataArr];
      expect(values).toEqual(value);
    },
  );
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
    const { chartData } = getChartData(
      data.slice(0, 1),
      generateLoadSummaryData(),
    );
    const [value] = chartData.slumpTargetChartData;
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
    const { chartData } = getChartData(data, generateLoadSummaryData());
    const slumpLength = chartData.slumpTargetChartData.length;
    const totalRevsLength = chartData.totalRevolutionsChartData.length;
    const currentRpmLength = chartData.totalRevolutionsChartData.length;
    expect(totalRevsLength).toEqual(slumpLength);
    expect(currentRpmLength).toEqual(slumpLength);
  });
  it.each`
    referenceData       | value
    ${"referenceLines"} | ${referenceLines}
    ${"referenceAreas"} | ${referenceAreas}
  `(
    "should get $referenceData",
    ({ referenceData, value }: GetReferenceDataProps) => {
      const chartData = getChartData(data, generateLoadSummaryData());
      const values = chartData[referenceData];
      expect(values).toEqual(value);
    },
  );
});

interface GetChartDataProps {
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

interface GetReferenceDataProps {
  referenceData: "referenceLines" | "referenceAreas";
  value: RefLine | RefArea | string;
}
