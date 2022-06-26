import React, { useState, useEffect } from "react";
import PlantChart from "./PlantChart";
import { Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import PlantStatsBar from "./PlantStatsBar";
import { Box } from "@mui/material";

const Plant = (props) => {
  let navigate = useNavigate();

  let id = useParams().plantId;
  if (id === undefined) {
    id = props.plantId;
  }
  const [plant, setPlant] = useState(null);
  const [voltages, setVoltages] = useState({
    data: [],
    name: "voltage",
    title: "Voltage",
    color: "255, 99, 132",
  });
  const [waters, setWaters] = useState({
    data: [],
    name: "water",
    title: "Water",
    color: "28,163,236",
  });
  const [suns, setSuns] = useState({
    data: [],
    name: "sun",
    title: "Sun",
    color: "252, 212, 64",
  });

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
              setVoltages({
                ...voltages,
                data: data.data,
              });
            })
            .catch(console.log);
          fetch(
            `https://plants.hoppingadventure.com/api/plants/${id}/measures/waters`
          )
            .then((res) => res.json())
            .then((data) => {
              setWaters({
                ...waters,
                data: data.data,
              });
            })
            .catch(console.log);
          fetch(
            `https://plants.hoppingadventure.com/api/plants/${id}/measures/suns`
          )
            .then((res) => res.json())
            .then((data) => {
              setSuns({
                ...suns,
                data: data.data.map((obj) => {
                  return {
                    ...obj,
                    sun: 65535 - obj.sun,
                  };
                }),
              });
            })
            .catch(console.log);
        }
      })
      .catch(console.log);
  }, []);

  let width = props.showLink ? "20vw" : "80vw";
  return (
    <Card
      className="m-1 text-center"
      style={{ width: width, minWidth: "20rem" }}
    >
      <Card.Img
        className="mx-auto m-2"
        style={{ maxWidth: "20vw" }}
        variant="top"
        src={require("../images/plant.webp")}
      />
      <Card.Body>
        {plant != null && (
          <div>
            <Card.Title className="my-2">{plant.name}</Card.Title>
            <Card.Subtitle className="mb-2">
              <img
                className="align-middle mx-1"
                style={{ height: "1em" }}
                alt=""
                src={require("../images/birthday.png")}
              />
              <span className="align-middle mx-1">
                {new Date(plant.birth).toLocaleDateString()}
              </span>
            </Card.Subtitle>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                width: "100%",
              }}
              marginY={3}
            >
              {/* <PlantStatsBar
                value={30}
                color="power"
                size={90}
                text={"Power"}
              ></PlantStatsBar>
              <PlantStatsBar
                value={70}
                color="sun"
                size={90}
                text={"Sun"}
              ></PlantStatsBar>
              <PlantStatsBar
                value={10}
                color="water"
                size={90}
                text={"Water"}
              ></PlantStatsBar> */}
            </Box>
            <PlantChart data={voltages} />
            <PlantChart data={waters} />
            <PlantChart data={suns} />
            {props.showLink && (
              <Card.Link
                onClick={() => {
                  console.log(plant.id);
                  navigate("" + plant.id, { replace: false });
                }}
                className="btn btn-primary stretched-link mt-3 center"
                style={{ width: "100%" }}
              >
                Open
              </Card.Link>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
export default Plant;
