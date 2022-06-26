import React from "react";
import "chartjs-adapter-moment";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const PlantChart = ({ data }) => {
  const dataArray = data.data.filter((d) => d[data.name] != null);
  return (
    <Line
      options={{
        responsive: true,
        scales: {
          xAxes: {
            type: "time",
            time: {
              unit: "day",
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 6,
              minRotation: 90,
              maxRotation: 90,
            },
          },
          yAxes: {
            min: 0,
          },
        },
        legend: {
          position: "top",
        },
      }}
      data={{
        labels: dataArray.map((d) => d.date),
        datasets: [
          {
            label: data.title,
            data: dataArray.map((d) => ({
              x: d.date,
              y: d[data.name],
            })),
            borderColor: "rgb(" + data.color + ")",
            backgroundColor: "rgba(" + data.color + ",0.5)",
            borderWidth: 1,
            pointBorderWidth: 1,
            pointRadius: 1,
            pointHoverRadius: 2,
          },
        ],
      }}
    />
  );
};

export default PlantChart;
