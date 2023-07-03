import "../../custom.css";
import React from "react";
import axios from "axios";
import { useState, useContext, useEffect, useRef } from "react";
import { NetworkContext } from "../context/NetworkContext";
import { Row } from "react-bootstrap";
import { Button } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.min.css";
import { ToastContainer, toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";

export function SyncAdjacentPeers() {
	// const [peerMap, setPeerMap] = useState({});

	const [arrow1To5Class, setArrow1To5Class] = useState("arrow-dull");
	const [arrow1To2Class, setArrow1To2Class] = useState("arrow-dull");

	const [arrow2To1Class, setArrow2To1Class] = useState("arrow-dull");
	const [arrow2To3Class, setArrow2To3Class] = useState("arrow-dull");

	const [arrow3To2Class, setArrow3To2Class] = useState("arrow-dull");
	const [arrow3To4Class, setArrow3To4Class] = useState("arrow-dull");

	const [arrow4To3Class, setArrow4To3Class] = useState("arrow-dull");
	const [arrow4To5Class, setArrow4To5Class] = useState("arrow-dull");

	const [arrow5To4Class, setArrow5To4Class] = useState("arrow-dull");
	const [arrow5To1Class, setArrow5To1Class] = useState("arrow-dull");

	const [node1BoxClass, setNode1BoxClass] = useState("current-box-dull");
	const [node2BoxClass, setNode2BoxClass] = useState("current-box-dull");
	const [node3BoxClass, setNode3BoxClass] = useState("current-box-dull");
	const [node4BoxClass, setNode4BoxClass] = useState("current-box-dull");
	const [node5BoxClass, setNode5BoxClass] = useState("current-box-dull");

	const [adjNode2To1BoxClass, setAdjNode2To1BoxClass] =
		useState("node-box-dull");
	const [adjNode5To1BoxClass, setAdjNode5To1BoxClass] =
		useState("node-box-dull");
	const [adjNode3To2BoxClass, setAdjNode3To2BoxClass] =
		useState("node-box-dull");
	const [adjNode1To2BoxClass, setAdjNode1To2BoxClass] =
		useState("node-box-dull");
	const [adjNode4To3BoxClass, setAdjNode4To3BoxClass] =
		useState("node-box-dull");
	const [adjNode2To3BoxClass, setAdjNode2To3BoxClass] =
		useState("node-box-dull");
	const [adjNode5To4BoxClass, setAdjNode5To4BoxClass] =
		useState("node-box-dull");
	const [adjNode3To4BoxClass, setAdjNode3To4BoxClass] =
		useState("node-box-dull");
	const [adjNode1To5BoxClass, setAdjNode1To5BoxClass] =
		useState("node-box-dull");
	const [adjNode4To5BoxClass, setAdjNode4To5BoxClass] =
		useState("node-box-dull");

	const { activePorts, setActivePorts, chosenPorts, setChosenPorts } =
		useContext(NetworkContext);

	useEffect(() => {
		chosenPorts.forEach(port => {
			setClasses(port);
		});
		// console.log("chosen:" + chosenPorts);
	}, []);

	const handleSyncClick = async port => {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};
		let nextPort;
		let prevPort;
		let bodyNext;
		let bodyPrev;
		let portPlus2;
		let portPlus3;

		if (port === 5555) {
			nextPort = 5556;
			prevPort = 5559;
			portPlus2 = 5557;
			portPlus3 = 5558;
		} else if (port === 5556) {
			nextPort = 5557;
			prevPort = 5555;
			portPlus2 = 5558;
			portPlus3 = 5559;
		} else if (port === 5557) {
			nextPort = 5558;
			prevPort = 5556;
			portPlus2 = 5559;
			portPlus3 = 5555;
		} else if (port === 5558) {
			nextPort = 5559;
			prevPort = 5557;
			portPlus2 = 5555;
			portPlus3 = 5556;
		} else if (port === 5559) {
			nextPort = 5555;
			prevPort = 5558;
			portPlus2 = 5556;
			portPlus3 = 5557;
		}

		// Sync Current Node with Next Node
		try {
			bodyNext = {
				peerUrl: `http://localhost:${nextPort}`,
			};

			const syncResultNext = await axios.post(
				`http://localhost:${port}/peers/connect`,
				bodyNext,
				config
			);

			const resultNext = syncResultNext.data.message;

			toast.success(resultNext, {
				position: "top-right",
				theme: "light",
			});
		} catch (error) {
			// const errorNext = syncResultNext.data.errorMsg;
			const errorNext =
				`Connecting ${port} to ${nextPort}` ||
				error.response?.data?.errorMsg ||
				"Unknown error occurred.";
			toast.success(errorNext, {
				position: "top-right",
				theme: "light",
			});
			console.error(error);
		}

		// Sync Current Node with Previous Node
		try {
			bodyPrev = {
				peerUrl: `http://localhost:${prevPort}`,
			};

			const syncResultPrev = await axios.post(
				`http://localhost:${port}/peers/connect`,
				bodyPrev,
				config
			);

			const resultPrev = syncResultPrev.data.message;
			// setClasses(port);

			toast.success(resultPrev, {
				position: "top-right",
				theme: "light",
			});
		} catch (error) {
			const errorPrev =
				`Connecting ${port} to ${prevPort}` ||
				error.response?.data?.errorMsg ||
				"Unknown error occurred.";
			toast.success(errorPrev, {
				position: "top-right",
				theme: "light",
			});
		}

		// Sync Prev Node with Next Node
		try {
			let bodyNext2 = {
				peerUrl: `http://localhost:${nextPort}`,
			};

			const syncResultPrevToNext = await axios.post(
				`http://localhost:${prevPort}/peers/connect`,
				bodyNext2,
				config
			);

			const resultPrevToNext = syncResultPrevToNext.data.message;
			toast.success(resultPrevToNext, {
				position: "top-right",
				theme: "light",
			});
		} catch (error) {
			const errorPrevToNext =
				`Connecting ${prevPort} to ${nextPort}` ||
				error.response?.data?.errorMsg ||
				"Unknown error occurred.";

			toast.success(errorPrevToNext, {
				position: "top-right",
				theme: "light",
			});
		}
		setClasses(port);

		// Update activePorts Array
		if (!activePorts.includes(port)) {
			activePorts.push(port);
		}
		if (!activePorts.includes(nextPort)) {
			activePorts.push(nextPort);
		}
		if (!activePorts.includes(prevPort)) {
			activePorts.push(prevPort);
		}
		console.log("activePorts", activePorts);
		activePorts.sort();
		setActivePorts(activePorts);
		chosenPorts.push(port);
		setChosenPorts(chosenPorts);
	};

	const setClasses = port => {
		if (port === 5555) {
			setNode1BoxClass("current-box-bright");
			setAdjNode2To1BoxClass("node-box-bright");
			setAdjNode5To1BoxClass("node-box-bright");
			setArrow1To2Class("arrow-bright");
			setArrow1To5Class("arrow-bright");
		} else if (port === 5556) {
			setNode2BoxClass("current-box-bright");
			setAdjNode3To2BoxClass("node-box-bright");
			setAdjNode1To2BoxClass("node-box-bright");
			setArrow2To3Class("arrow-bright");
			setArrow2To1Class("arrow-bright");
		} else if (port === 5557) {
			setNode3BoxClass("current-box-bright");
			setAdjNode4To3BoxClass("node-box-bright");
			setAdjNode2To3BoxClass("node-box-bright");
			setArrow3To4Class("arrow-bright");
			setArrow3To2Class("arrow-bright");
		} else if (port === 5558) {
			setNode4BoxClass("current-box-bright");
			setAdjNode5To4BoxClass("node-box-bright");
			setAdjNode3To4BoxClass("node-box-bright");
			setArrow4To5Class("arrow-bright");
			setArrow4To3Class("arrow-bright");
		} else if (port === 5559) {
			setNode5BoxClass("current-box-bright");
			setAdjNode1To5BoxClass("node-box-bright");
			setAdjNode4To5BoxClass("node-box-bright");
			setArrow5To1Class("arrow-bright");
			setArrow5To4Class("arrow-bright");
		}
	};

	return (
		<div>
			<ToastContainer
				position="top-right"
				closeOnClick
				draggable
				pauseOnHover
				theme="light"
			/>
			<h1>Network Nodes</h1>
			{/* {activePorts.length > 0 ? (
				<h3 className="center-text">Active Ports: {activePorts.join(", ")}</h3>
			) : (
				<h3 className="center-text">Active Ports: None</h3>
			)} */}
			<div className="center-img">
				<img
					style={{ width: 225, height: 200 }}
					src="../src/assets/nodes-85.png"
					alt="Pickaxe Image"
				></img>
			</div>
			<br />
			<div className="bg-glass-1">
				{activePorts.length > 0 ? (
					<h3 className="center-text">
						Active Ports: {activePorts.join(", ")}
					</h3>
				) : (
					<h3 className="center-text">Active Ports: None</h3>
				)}
			</div>
			<br />
			<div className="container-fluid">
				<div className="card-md-2">
					<div className="card-body-md-0">
						<h4 className="card-title-2">Syncing Adjacent Network Nodes</h4>
						<div className="scrollable">
							<div>
								<span className={adjNode5To1BoxClass}>Node 5</span>
								<span className={arrow1To5Class}>
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className={node1BoxClass}>Node 1</span>
								<span className={arrow1To2Class}>
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className={adjNode2To1BoxClass}>Node 2</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

								<div className="btn-justify-end">
									<Button
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										onClick={() => handleSyncClick(5555)} // Pass the port associated with Node 1
									>
										Sync Node 1
									</Button>
								</div>
							</div>
							<br />
							<div>
								<span className={adjNode1To2BoxClass}>Node 1</span>
								<span className={arrow2To1Class}>
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className={node2BoxClass}>Node 2</span>
								<span className={arrow2To3Class}>
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className={adjNode3To2BoxClass}>Node 3</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

								<div className="btn-justify-end">
									<Button
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										onClick={() => handleSyncClick(5556)} // Pass the port associated with Node 2
									>
										Sync Node 2
									</Button>
								</div>
							</div>
							<br />
							<div>
								<span className={adjNode2To3BoxClass}>Node 2</span>
								<span className={arrow3To2Class}>
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className={node3BoxClass}>Node 3</span>
								<span className={arrow3To4Class}>
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className={adjNode4To3BoxClass}>Node 4</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

								<div className="btn-justify-end">
									<Button
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										onClick={() => handleSyncClick(5557)} // Pass the port associated with Node 3
									>
										Sync Node 3
									</Button>
								</div>
							</div>
							<br />
							<div>
								<span className={adjNode3To4BoxClass}>Node 3</span>
								<span className={arrow4To3Class}>
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className={node4BoxClass}>Node 4</span>
								<span className={arrow4To5Class}>
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className={adjNode5To4BoxClass}>Node 5</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

								<div className="btn-justify-end">
									<Button
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										onClick={() => handleSyncClick(5558)} // Pass the port associated with Node 4
									>
										Sync Node 4
									</Button>
								</div>
							</div>
							<br />
							<div>
								<span className={adjNode4To5BoxClass}>Node 4</span>
								<span className={arrow5To4Class}>
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className={node5BoxClass}>Node 5</span>
								<span className={arrow5To1Class}>
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className={adjNode1To5BoxClass}>Node 1</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

								<div className="btn-justify-end">
									<Button
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										onClick={() => handleSyncClick(5559)} // Pass the port associated with Node 5
									>
										Sync Node 5
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<br />
		</div>
	);
}

export default SyncAdjacentPeers;
