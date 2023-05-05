import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { ethers } from "ethers";
import purplecryptochart from "../assets/purplecryptochart.jpg";
//import ReactLoading from "react-loading";

function Faucet() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddressChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const target = event.target;

    faucetTxnSend({
      recipientAddress: formInputs.recipient,
      amount: formInputs.amount,
    });

    target.reset();

    navigate("/userAddress", { state: { linkData: formInputs.recipient } });

    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "http://localhost:5173"
      );
      const signer = provider.getSigner();
      const tx = signer.sendTransaction({
        to: address,
        value: ethers.utils.parseEther("0.1"),
      });
      console.log(tx);
      setLoading(false);
      setAddress("");
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

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

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formAddress">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter address"
                value={address}
                onChange={handleAddressChange}
              />

              <Form.Label>Node URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="URL Address"
                value={address}
                onChange={handleAddressChange}
              />
            </Form.Group>

            <Button
              className="faucetbutton"
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Loading..." : "Submit"}
            </Button>

            {error && <p className="text-danger">{error}</p>}
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Faucet;
