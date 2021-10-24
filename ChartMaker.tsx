import React, { ReactNode } from "react";
import Divider from "@material-ui/core/Divider";
import Paper from "@material-ui/core/Paper";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import makeStyles from "@material-ui/core/styles/makeStyles";
// Internal
import RevealInfo from "../RevealInfo";

const useStyles = makeStyles(
  ({ palette: { grey }, spacing, typography: { pxToRem } }: Theme) => ({
    chartContainer: {
      alignItems: "flex-end",
      display: "flex",
      height: spacing(22),
      margin: `0px ${spacing(1)}px`,
    },
    paper: {
      borderBottom: `${pxToRem(1)} solid ${grey[500]}`,
    },
  }),
);

export default ({ children, title }: ChartProps) => {
  const classes = useStyles();
  const isXs = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));

  if (isXs) {
    return (
      <div>
        <RevealInfo title={title}>
          <div className={classes.chartContainer}>{children}</div>
        </RevealInfo>
        <Divider />
      </div>
    );
  }

  return (
    <Paper square className={classes.paper}>
      <RevealInfo title={title}>
        <div className={classes.chartContainer}>{children}</div>
      </RevealInfo>
    </Paper>
  );
};

interface ChartProps {
  children: ReactNode;
  title: string;
}
