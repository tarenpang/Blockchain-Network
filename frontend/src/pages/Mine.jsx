import "../../custom.css";
import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Col, Row, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

function Wallet() {
	const [allConfirmedTransactions, setAllConfirmedTransactions] = useState([]);

	useEffect(() => {
		(async function loadData() {
			const confirmedTransactions = await axios.get(
				`http://localhost:5555/transactions/confirmed`
			);
			setAllConfirmedTransactions(
				confirmedTransactions.data.reverse().slice(0, 10)
			);
		})();
	}, []);

	const trimAddress = (address) => {
		const start = address.split("").slice(0, 14).join("");
		const end = address.split("").slice(-6).join("");
		return `${start}...${end}`;
	};

	return (
		<div>
			<br />
			<h1>Mine</h1>
			<div className="card-body" style={{ overflowY: "auto" }}>
				{allConfirmedTransactions &&
					allConfirmedTransactions.map((d, index) => (
						<div key={index}>
							<div className="row">
								{/* col 1 */}
								<div className="col-md-3">
									<div>
										<div className=" d-flex align-items-center">
											<div className="">
												<div
													className={
														d.transferSuccessful
															? "border border-success rounded-circle text-success fs-5"
															: "border  border-warning rounded-circle text-warning fs-5"
													}
													style={{
														// backgroundColor: "#e2e7e9",
														paddingRight: "0.4rem",
														paddingLeft: "0.4rem",
														marginTop: "0.4rem",
													}}
												>
													Tx
												</div>
											</div>
											<div className=" px-2">
												<div className=" text-secondary">
													<Link
														to={`/transaction/${d.transactionDataHash.toString()}`}
													>
														<a style={{ textDecoration: "none" }}>
															{`${d.transactionDataHash
																.split("")
																.slice(0, 8)
																.join("")}...`}
														</a>
													</Link>
												</div>
											</div>
										</div>
									</div>
								</div>
								{/* col 2 */}
								<div className="col-md-6">
									<div className="px-4">
										<div className="text-secondary">
											From:{" "}
											<Link to={`/address/${d.from.toString()}`}>
												<a href="#" style={{ textDecoration: "none" }}>
													{trimAddress(d.from)}
												</a>
											</Link>
										</div>
										<div className="text-secondary">
											To:{" "}
											<Link to={`/address/${d.to.toString()}`}>
												<a href="#" style={{ textDecoration: "none" }}>
													{trimAddress(d.to)}
												</a>
											</Link>
										</div>
									</div>
								</div>
								{/* col 3 */}
								<div className="col-md-3">
									<div className=" ">
										<div className="  d-flex justify-content-end ">
											{`${d.value.toLocaleString("en-CA")} IndiGold`}
										</div>
										<div></div>
									</div>
								</div>
							</div>

							<hr />
						</div>
					))}
			</div>
		</div>
	);
}

export default Wallet;
