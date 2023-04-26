import React from "react";
import ReactDOM from "react-dom/client";
import {
	createBrowserRouter,
	RouterProvider,
	Route,
	Outlet,
	createRoutesFromElements,
} from "react-router-dom";
import "../custom.css";
import Faucet from "./pages/Faucet";
import Navbar from "./navigation/Navbar";
import Explorer from "./pages/Explorer";
import LandingPage from "./pages/LandingPage";
import Wallet from "./pages/Wallet";

const Layout = () => {
	return (
		<div>
			<Navbar />
			<Outlet />
		</div>
	);
};

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route element={<Layout />}>
			<Route path="/" element={<LandingPage />}></Route>
			<Route path="/faucet" element={<Faucet />}></Route>
			<Route path="/explorer" element={<Explorer />}></Route>
			<Route path="/wallet" element={<Wallet />}></Route>
		</Route>
	)
);

ReactDOM.createRoot(document.getElementById("root")).render(
	<RouterProvider router={router} />
);
