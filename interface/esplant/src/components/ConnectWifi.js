import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SignalWifi4BarIcon from "@mui/icons-material/SignalWifi4Bar";

const theme = createTheme();

export default function ConnectWifi() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    function setWifiCredentials() {
      fetch(
        "http://192.168.4.1/setWiFi?" +
          new URLSearchParams({
            ssid: data.get("ssid"),
            password: data.get("password"),
          })
      )
        .then((res) => {
          console.log(res);
        })
        .catch(console.log);
    }

    if (data.get("plant-id")) {
      fetch(
        "http://192.168.4.1/setId?" +
          new URLSearchParams({
            id: data.get("plant-id"),
          })
      )
        .then((res) => {
          console.log(res);
          setWifiCredentials();
        })
        .catch(console.log);
    } else {
      setWifiCredentials();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <SignalWifi4BarIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            WiFi Setup
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              fullWidth
              name="plant-id"
              label="Plant Id (leave empty to create new plant)"
              type="number"
              id="plant-id"
            />
            {/* <TextField
              margin="normal"
              fullWidth
              name="plant-name"
              label="Plant Name"
              type="text"
              id="plant-name"
            /> */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="ssid"
              label="SSID"
              name="ssid"
              autoComplete="ssid"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Connect
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
