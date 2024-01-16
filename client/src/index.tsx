import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enUS } from "@mui/x-date-pickers/locales";

const root = ReactDOM.createRoot(document.getElementById("container") as HTMLElement);
root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs} localeText={enUS.components.MuiLocalizationProvider.defaultProps.localeText}>
      <App />
    </LocalizationProvider>
  </React.StrictMode>
);
