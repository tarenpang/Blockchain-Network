import "../../custom.css";
import React from "react";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Row } from "react-bootstrap";
import { Button } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.min.css";
import { ToastContainer, toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";

function Sync() {
	const [peerInfo, setPeerInfo] = useState({});

	useEffect(() => {
		(async function loadData() {
			const peerInfo = await axios.get(`http://localhost:5555/info`);
			setPeerInfo(peerInfo.data);
		})();
	}, []);

	// const nodeToMine = `http://localhost:5555`;

	const handleSync1 = async (nodeToSync) => {
		// Sync with Next Node
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};

		const bodyNext = {
			peerUrl: "http://localhost:5556",
		};

		const syncResultNext = await axios.post(
			`http://localhost:5555/peers/connect`,
			bodyNext,
			config
		);

		const resultNext = syncResult.data.message;

		if (syncResultNext) {
			toast.success(resultNext, {
				position: "top-right",
				theme: "light",
			});
		}

		// Sync with Previous Node
		// const bodyPrev = {
		// 	peerUrl: "http://localhost:5559",
		// };

		// const syncResultPrev = await axios.post(
		// 	`http://localhost:5555/peers/connect`,
		// 	bodyPrev,
		// 	config
		// );

		// const resultPre4v = syncResult.data.message;

		// if (syncResultPrev) {
		// 	toast.success(resultPrev, {
		// 		position: "top-right",
		// 		theme: "light",
		// 	});
		// }
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
			<br />
			<h1>Network Nodes</h1>
			<div className="center-img">
				<img
					style={{ width: 225, height: 200 }}
					src="../src/assets/nodes-85.png"
					alt="Pickaxe Image"
				></img>
			</div>
			<br />
			<div className="container-fluid">
				<div className="card-md-2">
					<div className="card-body-md-0">
						<h4 className="card-title-2">Syncing the Network Nodes</h4>
						<div className="scrollable">
							<div>
								<span className="box-adj-glow">Node 5</span>
								<span className="arrow-bright">
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className="box-target-glow">Node 1</span>
								<span className="arrow-bright">
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className="box-adj-glow">Node 2</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

								<div className="btn-justify-end">
									<Button
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										onClick={handleSync1}
									>
										Sync Node 1
									</Button>
								</div>
							</div>
							<br />
							<div>
								<span className="box-adj">Node 1</span>
								<span className="arrow-dull">
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className="box-target">Node 2</span>
								<span className="arrow-dull">
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className="box-adj">Node 3</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

								<div className="btn-justify-end">
									<Button
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										// onClick={handleSyncClick}
									>
										Sync Node 2
									</Button>
								</div>
							</div>
							<br />
							<div>
								<span className="box-adj">Node 2</span>
								<span className="arrow-dull">
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className="box-target">Node 3</span>
								<span className="arrow-dull">
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className="box-adj">Node 4</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

								<div className="btn-justify-end">
									<Button
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										// onClick={handleSyncClick}
									>
										Sync Node 3
									</Button>
								</div>
							</div>
							<br />
							<div>
								<span className="box-adj">Node 3</span>
								<span className="arrow-dull">
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className="box-target">Node 4</span>
								<span className="arrow-dull">
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className="box-adj">Node 5</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

								<div className="btn-justify-end">
									<Button
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										// onClick={handleSyncClick}
									>
										Sync Node 4
									</Button>
								</div>
							</div>
							<br />
							<div>
								<span className="box-adj">Node 4</span>
								<span className="arrow-dull">
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className="box-target">Node 5</span>
								<span className="arrow-dull">
									{" "}
									<b>&lt;&lt;&lt;&lt;&gt;&gt;&gt;&gt;</b>{" "}
								</span>
								<span className="box-adj">Node 1</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

								<div className="btn-justify-end">
									<Button
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										// onClick={handleSyncClick}
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

export default Sync;
