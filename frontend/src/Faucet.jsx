import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { ethers } from "ethers";

function Faucet() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "http://localhost:5174"
      );
      const signer = provider.getSigner();
      const tx = await signer.sendTransaction({
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
    <div>
      <h1>Web3 Faucet</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formAddress">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter address"
            value={address}
            onChange={handleAddressChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </Button>
      </Form>
      {error && <p className="text-danger">{error}</p>}
    </div>
  );
}

export default Faucet;
