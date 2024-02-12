import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Client, Presets } from "userop";
import Modal from "react-modal";

Modal.setAppElement("#root"); // This line is required for accessibility reasons

function SimpleAccount({ signerAddress }) {
  const [simpleAccountAddress, setSimpleAccountAddress] = useState(null);
  const [simpleAccount, setSimpleAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [mainBalance, setMainBalance] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0);
  const [provider, setProvider] = useState(null);
  const [client, setClient] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [userOpHash, setUserOpHash] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  useEffect(() => {
    const initializeSimpleAccount = async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log("provider: " + JSON.stringify(provider));
        console.log("window.ethereum: " + JSON.stringify(window.ethereum));
        setProvider(provider);
        const signer = provider.getSigner(signerAddress);

        const _simpleAccount = await Presets.Builder.SimpleAccount.init(
          signer,
          process.env.REACT_APP_RPC_URL,
          process.env.REACT_APP_ENTRY_POINT,
          process.env.REACT_APP_SIMPLE_ACCOUNT_FACTORY
        );

        if (_simpleAccount) {
          setSimpleAccount(_simpleAccount);
          setSimpleAccountAddress(_simpleAccount.getSender());
          const client = await Client.init(
            process.env.REACT_APP_RPC_URL,
            process.env.REACT_APP_ENTRY_POINT
          );
          setClient(client);

          // Get account balance
          const balance = await provider.getBalance(_simpleAccount.getSender());
          setBalance(ethers.utils.formatEther(balance));
          console.log(_simpleAccount.getSender());
          console.log(balance);
          const mainBalance = await provider.getBalance(signerAddress);
          setMainBalance(ethers.utils.formatEther(mainBalance));
        } else {
          console.error("simpleAccount or simpleAccount.address is undefined");
        }
      }
    };

    if (signerAddress) {
      initializeSimpleAccount();
    }
  }, [signerAddress]);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleTransfer = async () => {
    const value = ethers.utils.parseEther(amount.toString()); // Convert to wei

    const res = await client.sendUserOperation(
      simpleAccount.execute(recipient, value, "0x"),
      { onBuild: (op) => console.log("Signed UserOperation:", op) }
    );
    console.log(`UserOpHash: ${res.userOpHash}`);
    setUserOpHash(res.userOpHash);

    console.log("Waiting for transaction...");
    setTransactionHash("Waiting for transaction...");
    const ev = await res.wait();
    console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
    setTransactionHash(ev?.transactionHash ?? null);

    // Update balance
    const balance = await provider.getBalance(simpleAccountAddress);
    setBalance(ethers.utils.formatEther(balance));

    closeModal();
  };

  const handleTransferErc20 = async () => {
    const token = "0x2ab0e9e4ee70fff1fb9d67031e44f6410170d00e"; // Address of the ERC-20 token
    const ERC20_ABI = require("./../../erc20Abi.json"); // ERC-20 ABI in json format
    const erc20 = new ethers.Contract(token, ERC20_ABI, provider);
    const value = ethers.utils.parseEther(amount.toString()); // Convert to wei

    const callTo = [token];
    const callData = [
      erc20.interface.encodeFunctionData("transfer", [recipient, value]),
    ];

    const res = await client.sendUserOperation(
      simpleAccount.executeBatch(callTo, callData),
      {
        onBuild: (op) => console.log("Signed UserOperation:", op),
      }
    );
    console.log(`UserOpHash: ${res.userOpHash}`);
    setUserOpHash(res.userOpHash);

    console.log("Waiting for transaction...");
    setTransactionHash("Waiting for transaction...");
    const ev = await res.wait();
    console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
    setTransactionHash(ev?.transactionHash ?? null);

    // Update balance
    const balance = await provider.getBalance(simpleAccountAddress);
    setBalance(ethers.utils.formatEther(balance));

    closeModal();
  };

  const handleApproveErc20 = async () => {
    const token = "0x2ab0e9e4ee70fff1fb9d67031e44f6410170d00e"; // Address of the ERC-20 token
    const ERC20_ABI = require("./../../erc20Abi.json"); // ERC-20 ABI in json format
    const erc20 = new ethers.Contract(token, ERC20_ABI, provider);
    const value = ethers.utils.parseEther(amount.toString()); // Convert to wei
    const failsafe = "0xDc74D4c4F755BcCE45097910B0b98f4D9B1Ff3ED"; // Address of the ERC-20 token
    const owner = await erc20.name();
    console.log(owner);

    const callTo = [token];
    const callData = [
      erc20.interface.encodeFunctionData("approve", [failsafe, value]),
    ];

    const res = await client.sendUserOperation(
      simpleAccount.executeBatch(callTo, callData),
      {
        onBuild: (op) => console.log("Signed UserOperation:", op),
      }
    );
    console.log(`UserOpHash: ${res.userOpHash}`);
    setUserOpHash(res.userOpHash);

    console.log("Waiting for transaction...");
    setTransactionHash("Waiting for transaction...");
    const ev = await res.wait();
    console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
    setTransactionHash(ev?.transactionHash ?? null);

    // Update balance
    const balance = await provider.getBalance(simpleAccountAddress);
    setBalance(ethers.utils.formatEther(balance));

    closeModal();
  };

  return (
    <div>
      {simpleAccountAddress ? (
        <>
          <p>main Address: {signerAddress}</p>
          <p>Balance: {mainBalance} ETH</p>
          <p>ERC 4337 smart wallet Address: {simpleAccountAddress}</p>
          <p>Balance: {balance} ETH</p>
          <p>
            Failsafe Contract Address :
            0xDc74D4c4F755BcCE45097910B0b98f4D9B1Ff3ED
          </p>

          <button onClick={openModal}>Transfer</button>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Transfer Modal"
          >
            <h2>Transfer</h2>
            <input
              type="text"
              placeholder="Recipient"
              onChange={(e) => setRecipient(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={handleTransfer}>Confirm Transfer</button>
            <button onClick={closeModal}>Close</button>
            <div>
              <p>UserOpHash: {userOpHash}</p>
              <p>Transaction Hash: {transactionHash}</p>
            </div>
          </Modal>

          <button onClick={openModal}>Transfer ERC20</button>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Transfer ERC20 Modal"
          >
            <h2>Transfer</h2>
            <input
              type="text"
              placeholder="Recipient"
              onChange={(e) => setRecipient(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={handleTransferErc20}>
              Confirm Transfer ERC20
            </button>
            <button onClick={closeModal}>Close</button>
            <div>
              <p>UserOpHash: {userOpHash}</p>
              <p>Transaction Hash: {transactionHash}</p>
            </div>
          </Modal>

          <button onClick={openModal}>Approve to failsafe ERC20</button>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Approve to failsafe ERC20 Modal"
          >
            <h2>Approve to failsafe</h2>
            <input
              type="number"
              placeholder="Amount"
              onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={handleApproveErc20}>
              Confirm Approve to failsafe ERC20
            </button>
            <button onClick={closeModal}>Close</button>
            <div>
              <p>UserOpHash: {userOpHash}</p>
              <p>Transaction Hash: {transactionHash}</p>
            </div>
          </Modal>
        </>
      ) : (
        <p>Connect wallet to view ERC4337 smart contract Address</p>
      )}
    </div>
  );
}

export default SimpleAccount;
