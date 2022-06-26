import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PlantStatsBar from "./PlantStatsBar";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Link,
  Skeleton,
  Typography,
} from "@mui/material";
import { Cake, AvTimer } from "@mui/icons-material";

export default function PlantCard(props) {
  let navigate = useNavigate();

  let id = useParams().plantId;
  if (id === undefined) {
    id = props.plantId;
  }
  const [plant, setPlant] = useState(null);
  const [voltage, setVoltage] = useState();
  const [water, setWater] = useState();
  const [sun, setSun] = useState();
  const [lastMeasureTime, setLastMeasureTime] = useState();
  const [timeUntilNextMeasure, setTimeUntilNextMeasure] = useState();

  const timeBetweenMeasuresMs = 30 * 60 * 1000;

  let nextMeasureInterval;

  useEffect(() => {
    if (lastMeasureTime) {
      if (nextMeasureInterval) {
        clearInterval(nextMeasureInterval);
      }
      nextMeasureInterval = setInterval(() => {
        let timeSinceLastMeasureMs = new Date().valueOf() - lastMeasureTime;
        let timeUntilNextMeasureDate = new Date(
          timeBetweenMeasuresMs - timeSinceLastMeasureMs
        );
        setTimeUntilNextMeasure(
          `${timeUntilNextMeasureDate.getMinutes()}:${String(
            timeUntilNextMeasureDate.getSeconds()
          ).padStart(2, "0")}`
        );
      }, 1000);
    }
  }, [lastMeasureTime]);

  useEffect(() => {
    // check if plant with id exists:
    fetch(`https://plants.hoppingadventure.com/api/plants/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data.length === 0) {
          console.log("Warning");
          navigate("../", { replace: true });
        } else {
          setPlant(data.data[0]);
          // plant exists, fetch other data:
          fetch(
            `https://plants.hoppingadventure.com/api/plants/${id}/measures/voltages`
          )
            .then((res) => res.json())
            .then((data) => {
              let curVoltage = data.data.reduce(function (prev, current) {
                return prev.date > current.date ? prev : current;
              }).voltage;
              // 3.0 V: battery full, 2.0 V: not enough power for esp
              let minVoltage = 2.0;
              let maxVoltage = 3.0;
              let voltagePercent =
                (curVoltage - minVoltage) / (maxVoltage - minVoltage);
              setVoltage(100 * voltagePercent);
            })
            .catch(console.log);
          fetch(
            `https://plants.hoppingadventure.com/api/plants/${id}/measures/waters`
          )
            .then((res) => res.json())
            .then((data) => {
              let maxWater = Math.max(...data.data.map((o) => o.water));
              let currentWaterObj = data.data.reduce(function (prev, current) {
                return prev.date > current.date ? prev : current;
              });
              setLastMeasureTime(currentWaterObj.date);
              let currentWater = currentWaterObj.water;
              fetch(
                `https://plants.hoppingadventure.com/api/plants/${id}/referenceWaters`
              )
                .then((res) => res.json())
                .then((data) => {
                  let minWater = data.data.reduce(function (prev, current) {
                    return prev.date > current.date ? prev : current;
                  }).referenceWater;
                  let waterPercentage =
                    (currentWater - minWater) / (maxWater - minWater);
                  setWater(100 * waterPercentage);
                });
            })
            .catch(console.log);
          fetch(
            `https://plants.hoppingadventure.com/api/plants/${id}/measures/suns`
          )
            .then((res) => res.json())
            .then((data) => {
              let minSun = Math.min(...data.data.map((o) => o.sun));
              let maxSun = Math.max(...data.data.map((o) => o.sun));
              let curSun = data.data.reduce(function (prev, current) {
                return prev.date > current.date ? prev : current;
              }).sun;
              // sun data is inverted
              curSun = maxSun - curSun;
              let sunPercentage = (curSun - minSun) / (maxSun - minSun);
              setSun(100 * sunPercentage);
            })
            .catch(console.log);
        }
      })
      .catch(console.log);
  }, []);

  return (
    <Card sx={{ maxWidth: 400, position: "relative", m: 2 }}>
      <CardMedia
        component="img"
        image={require("../images/plant.webp")}
        alt="Plant"
        sx={{ p: 2 }}
      />
      <CardContent>
        {plant != null && (
          <div>
            <Typography
              sx={{
                mb: 1,
                fontSize: 30,
                fontWeight: "bold",
                lineHeight: "100%",
              }}
            >
              {plant.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "start",
                alignItems: "flex-end",
                my: 1,
              }}
            >
              <Cake height="100%"></Cake>
              <Typography sx={{ lineHeight: "100%", mx: 1 }}>
                {new Date(plant.birth).toLocaleDateString()}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "start",
                alignItems: "flex-end",
                my: 1,
              }}
            >
              <AvTimer height="100%"></AvTimer>
              {timeUntilNextMeasure ? (
                <Typography sx={{ lineHeight: "100%", mx: 1 }}>
                  {timeUntilNextMeasure}
                </Typography>
              ) : (
                <Skeleton
                  variant="text"
                  width={50}
                  height="100%"
                  sx={{ mx: 1 }}
                />
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                my: 4,
              }}
            >
              {voltage && sun && water && (
                <>
                  <PlantStatsBar
                    value={voltage}
                    color="power"
                    size={90}
                    text={"Power"}
                  />
                  <PlantStatsBar
                    value={sun}
                    color="sun"
                    size={90}
                    text={"Sun"}
                  />
                  <PlantStatsBar
                    value={water}
                    color="water"
                    size={90}
                    text={"Water"}
                  />
                </>
              )}
            </Box>
            <Link
              onClick={() => {
                console.log(plant.id);
                navigate("" + plant.id, { replace: false });
              }}
              className="stretched-link"
              sx={{ width: "100%" }}
            >
              <Typography>Show</Typography>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
