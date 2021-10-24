import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@material-ui/core/styles";
import { theme } from "@vitm/components";
import LoadLifeCycle from ".";

const renderLoadHistory = () =>
  render(
    <ThemeProvider theme={theme}>
      <LoadLifeCycle data={[]} instructions={[]} />
    </ThemeProvider>,
  );

it("should render Load Life Cycle", () => {
  const { getByText } = renderLoadHistory();
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
