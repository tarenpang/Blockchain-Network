// import { useState } from "react"
// import "bootstrap/dist/css/bootstrap.min.css"
import { Router, Route } from "react-router-dom";
import Navbar from "./navigation/Navbar";
import LandingPage from "./pages/LandingPage";
// import "./App.css"
import "../custom.css";
import logo from "./assets/logo-04.png";

import React from "react";
import Faucet from "./pages/Faucet";

function App() {
	return (
		<div className="App">
			<Navbar />
			<br />

			<img className="logo" src={logo}></img>
			<h1>Hello Blockchain App</h1>

			{/* <div className="container">
				<Faucet />
			</div> */}
		</div>
	);
}

export default App;
