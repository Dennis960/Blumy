import "./App.css";
import Plants from "./components/Plants";
import SinglePlant from "./components/SinglePlant";

import React, { Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PlantStatsBar from "./components/PlantStatsBar";
import { createTheme, ThemeProvider } from "@mui/material";
import { amber, blue, red, yellow } from "@mui/material/colors";
import PlantCard from "./components/PlantCard";

const theme = createTheme({
  palette: {
    primary: amber,
    secondary: blue,
    sun: { main: yellow[500] },
    water: { main: blue[500] },
    power: { main: red[500] },
  },
});

class App extends Component {
  render() {
    return (
      <div className="App">
        <ThemeProvider theme={theme}>
          <BrowserRouter basename="plants">
            <Routes>
              <Route index element={<Plants />}></Route>
              <Route path="/:plantId" element={<SinglePlant />} />
              <Route
                path="/testPlants"
                element={<PlantCard plantId={1}></PlantCard>}
              />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </div>
    );
  }
}

export default App;
