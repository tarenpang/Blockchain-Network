import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import axios from "axios";
import { CircularProgress } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import "react-circular-progressbar/dist/styles.css";
import purplecryptochart from "../assets/purplecryptochart.jpg";

function Faucet() {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [balance, setBalance] = useState(0);
  //const [waitingTime, setWaitingTime] = useState(0);
  //const [error, setError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress >= 100 ? 0 : prevProgress + 1
      );
    }, 900);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    if (name === "address") {
      setAddress(value);
    } else if (name === "amount") {
      setAmount(value);
    }
  };

  const handleClick = async () => {
    setLoading(true);
    setProgress(0);
    setDisabled(true);

    const response = await fetch(
      `/faucet?address=${address}&amount=${amount}`,
      {
        method: "GET",
      }
    );

    setDisabled(false);
    setLoading(false);

    if (response.ok) {
      const data = await response.json();
      console.log(`Transaction hash: ${data.txHash}`);
      // display a success message to the user
    } else {
      console.error(`Failed to get coins: ${response.statusText}`);
      // display an error message to the user
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setProgress(0);
    setDisabled(true);

    const response = await fetch("/faucet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        amount,
      }),
    });

    setDisabled(false);
    setLoading(false);

    if (response.ok) {
      const data = await response.json();
      console.log(`Transaction hash: ${data.txHash}`);
      // display a success message to the user
    } else {
      console.error(`Failed to get coins: ${response.statusText}`);
      // display an error message to the user
    }
  };

  const handleDonate = async () => {
    setLoading(true);
    setProgress(0);
    setDisabled(true);

    const response = await fetch(`/donate`, {
      method: "GET",
    });

    setDisabled(false);
    setLoading(false);

    if (response.ok) {
      const data = await response.json();
      console.log(`Donation transaction hash: ${data.txHash}`);
      // display a success message to the user
    } else {
      console.error(`Failed to donate: ${response.statusText}`);
      // display an error message to the user
    }
  };

  const handleWithdrawal = async () => {
    setLoading(true);
    setDisabled(true);
    await axios.post("/api/faucet/withdraw", { address, amount });
    setLoading(false);
    setDisabled(false);
    startProgress();
  };

  const startProgress = () => {
    let intervalId;
    let count = 0;

    intervalId = setInterval(() => {
      count++;
      if (count > 100) {
        clearInterval(intervalId);
        setProgress(0);
        return;
      }
      setProgress(count);
    }, 900);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      const response = await fetch(`/balance?address=${address}`);
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      } else {
        console.error(`Failed to get balance: ${response.statusText}`);
        setBalance(0);
      }
    };
    if (address) {
      fetchBalance();
    }
  }, [address]);

  const addressBalance = balance > 0 ? `Balance: ${balance}` : "";

  return (
    <div
      className="bg-cover bg-fixed w-full h-full"
      style={{ backgroundImage: `url(${purplecryptochart})` }}
    >
      <div className="flex bg-gradient-to-b from-gray-900 via-transparent justify-center items-start w-full h-full text-white">
        <div className="font-medium mt-30">
          <h1>IndiGOLD Faucet</h1>
          <div className="pt-4 px-7 text-gray-200 font-normal">
            <p className="text-lg">
              Free service Faucet for Crypto Tokens{" "}
              <span className="text-med font-normal">(IndiGOLD)</span>.
              <br />
              There is a required 90 second waiting period between faucet
              withdrawals.
            </p>
          </div>
          <div className="flex-container">
            <img
              className="w-96 h-10 ms-5"
              style={{ width: 500, height: 350 }}
              src="../src/assets/Coin_Image.png"
              alt="Coin Image"
            ></img>
          </div>
          <Button
            variant="contained"
            color="primary"
            disabled={loading || disabled}
            onClick={handleDonate}
            className="w-96 h-10 ms-5"
          >
            {loading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm8 8a8 8 0 018-8h4a12 12 0 00-12 12v-4zm-4 0a4 4 0 100-8 4 4 0 000 8z"
                ></path>
              </svg>
            ) : (
              <>
                <svg
                  className="-ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a7 7 0 100 14 7 7 0 000-14zM4.84 6.56a5.25 5.25 0 116.92 6.92 5.28 5.28 0 01-6.92-6.92zm10.6 7.84a4 4 0 11-5.66-5.66 4 4 0 015.66 5.66z"
                    clipRule="evenodd"
                  />
                </svg>
                Donate
              </>
            )}
          </Button>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formAddress">
              <p className="mt-2 text-2xl">
                Available Balance: {addressBalance}{" "}
                <span className="text-sm font-normal">IndiGOLD</span>
              </p>

              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter address"
                className="border border-gray-400 px-4 py-2 w-96 rounded-lg mb-4"
                value={address}
                onChange={handleAddressChange}
                disabled={loading}
              />
              <Form.Label>Node URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="IndiGold Amount"
                className="border border-gray-400 px-4 py-2 w-96 rounded-lg mb-4"
                value={address}
                onChange={handleClick}
                disabled={loading}
              />
            </Form.Group>
            <Button
              variant="contained"
              color="primary"
              disabled={loading || disabled}
              onClick={handleWithdrawal}
              className="w-96 h-10 .p-"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Get IndiGOLD"
              )}
            </Button>
            {progress > 0 && (
              <div className="w-96 h-4 bg-gray-200 rounded-full mt-4">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
            {disabled && (
              <p className="text-gray-400 mt-4">
                Please wait 90 seconds before making another withdrawal.
              </p>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Faucet;
