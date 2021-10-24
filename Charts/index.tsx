import React from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import useTheme from "@material-ui/core/styles/useTheme";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {
  CartesianGrid,
  Legend,
  LegendProps,
  Line,
  LineProps,
  LineChart,
  ReferenceArea,
  ReferenceAreaProps,
  ReferenceLine,
  ReferenceLineProps,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  YAxisProps,
} from "recharts";

const useStyles = makeStyles(({ typography }: Theme) => ({
  referenceLine: {
    ...typography.h3,
  },
}));

const labelFormatter = (elapsedSeconds: number) => {
  const totalMinutes = Math.floor(elapsedSeconds / 60);
  const totalSecs = elapsedSeconds % 60;
  return `${totalMinutes}:${totalSecs.toString().padStart(2, "0")} min`;
};

const tickFormatter = (elapsedSeconds: number) =>
  `${Math.floor(elapsedSeconds / 60)}`;

export default <T extends Record<string, unknown>>({
  data,
  referenceLines,
  referenceAreas,
  lines,
  legendPayload,
  yAxisRange,
  ticks,
}: ChartDrawProps<T>) => {
  const {
    breakpoints,
    palette: {
      text: { primary, secondary },
      loadDetailColor: { discharge },
    },
  } = useTheme<Theme>();
  const isXs = useMediaQuery(breakpoints.down("xs"));
  const isSm = useMediaQuery(breakpoints.down("sm"));
  const classes = useStyles();

  return (
    <ResponsiveContainer width="100%" height={isXs ? 120 : 164}>
      <LineChart data={data} margin={{ right: 4, bottom: -4, left: 8 }}>
        <XAxis
          dataKey="elapsedSeconds"
          unit=" min" // NOTE space for formatting
          tickFormatter={tickFormatter}
          tickLine={false}
          axisLine={false}
          tickCount={6}
          type="number"
          domain={[0, "dataMax"]}
        />
        <YAxis
          width={26}
          tickLine={false}
          axisLine={false}
          tickCount={6}
          {...(yAxisRange && { domain: yAxisRange })}
          {...(ticks && { ticks })}
        />
        <CartesianGrid vertical={false} />
        {referenceAreas.map(({ x1, x2 }) => (
          <ReferenceArea x1={x1} x2={x2} fill={discharge} key={`${x1} ${x2}`} />
        ))}
        {referenceLines.map(({ x, label }) => (
          <ReferenceLine
            x={x}
            className={classes.referenceLine}
            label={({ viewBox }) => (
              <text x={viewBox.x} y="20" textAnchor="middle">
                {label}
              </text>
            )}
            stroke={secondary}
            key={x}
          />
        ))}
        <Tooltip
          labelFormatter={labelFormatter}
          itemStyle={{
            color: primary,
          }}
        />
        {lines.map(({ dataKey, color, name, dot }) => (
          <Line
            dataKey={dataKey}
            dot={isSm ? false : dot}
            fill={color}
            stroke={color}
            name={name}
            isAnimationActive={false}
            key={dataKey}
            connectNulls
          />
        ))}
        <Legend
          wrapperStyle={{ top: isXs ? -35 : -20 }}
          align="left"
          verticalAlign="middle"
          formatter={(value) => <span style={{ color: primary }}>{value}</span>}
          payload={[
            ...(legendPayload || []),
            {
              value: "Discharge (drum in reverse)",
              type: "circle",
              color: discharge,
              id: "discharge",
            },
          ]}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

interface ChartDrawProps<T extends Record<string, unknown>>
  extends ChartDataProps<T> {
  lines: DataLine[];
  legendPayload: LegendProps["payload"];
  yAxisRange?: YAxisProps["domain"];
  ticks?: YAxisProps["ticks"];
}

interface DataLine {
  dataKey: string;
  color: LineProps["color"];
  name: LineProps["name"];
  dot?: LineProps["dot"];
}

export interface ChartDataProps<T extends Record<string, unknown>> {
  data: Array<T>;
  referenceLines: RefLine[];
  referenceAreas: RefArea[];
}

export type RefLine = Pick<ReferenceLineProps, "x" | "label">;
export type RefArea = Pick<ReferenceAreaProps, "x1" | "x2">;

export interface BaseChartData {
  elapsedSeconds: number;
}
