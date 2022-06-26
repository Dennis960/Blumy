import {
  alpha,
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";

function ProgressWithLabel(props) {
  let progressValue = props.value;
  progressValue = progressValue < 0 ? 0 : progressValue;
  progressValue = progressValue > 100 ? 100 : progressValue;
  return (
    <Box sx={{ display: "flex" }}>
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
        }}
      >
        <CircularProgress
          {...props}
          variant="determinate"
          thickness={7}
          sx={{
            zIndex: 1,
            marginBottom: "-40%",
          }}
          style={{
            transform: "rotate(180deg)",
          }}
          value={progressValue / 2}
        />
        <CircularProgress
          {...props}
          variant="determinate"
          thickness={7}
          sx={{
            position: "absolute",
            marginBottom: "-40%",
          }}
          style={{
            transform: "rotate(180deg)",
            opacity: "0.3",
          }}
          value={50}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          fontSize={`${Math.round(props.size / 5)}px`}
          fontWeight={800}
          lineHeight={"100%"}
          sx={{
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10%",
          }}
        >
          {`${Math.round(props.value)}%`}
        </Typography>
        <LinearProgress
          {...props}
          variant="determinate"
          value={progressValue}
          sx={{
            position: "absolute",
            left: 0,
            bottom: 0,
            right: 0,
            height: `${Math.round(props.size / 30)}px`,
            width: "auto",
          }}
        ></LinearProgress>
      </Box>
    </Box>
  );
}

const PlantStatsBar = ({ value, color, size, text }) => {
  return (
    <Box
      sx={{
        display: "inline-flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ProgressWithLabel
        value={value}
        color={color}
        size={size}
      ></ProgressWithLabel>
      <Typography marginTop={1}>{text}</Typography>
    </Box>
  );
};

export default PlantStatsBar;
