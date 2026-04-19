import './index.css';
import React from "react";
import { render } from "react-dom";
import App from "./App";   // ✅ แก้ตรงนี้
import "./lib/firebase"; // add firebase

render(<App />, document.getElementById("root"));
