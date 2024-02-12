const { ethers } = require("ethers");
const { Client, Presets } = require("userop");
const ERC20_ABI = require("./erc20Abi.json"); // Assuming ERC20_ABI is exported
const config = require("./config.json");

async function main(tkn, s, amt, opts) {
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const spender = ethers.utils.getAddress(s);
  const erc20 = new ethers.Contract(tkn, ERC20_ABI, provider);
  const [symbol, decimals] = await Promise.all([
    erc20.symbol(),
    erc20.decimals(),
  ]);
  const amount = ethers.utils.parseUnits(amt, decimals);
  const value = ethers.utils.parseEther(amount.toString()); // Convert to wei
  const owner = await erc20.name();
  console.log(owner);

  const wallet = new ethers.Wallet(config.signingKey);
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    wallet,
    config.rpcUrl,
    config.ENTRY_POINT,
    config.SIMPLE_ACCOUNT_FACTORY
  );

  const client = await Client.init(config.rpcUrl, config.ENTRY_POINT);

  console.log("spender:", spender);

  console.log(`Approving ${amt} ${symbol}...`);

  const callTo = [tkn];
  const callData = [
    erc20.interface.encodeFunctionData("approve", [spender, value]),
  ];

  const res = await client.sendUserOperation(
    simpleAccount.executeBatch(callTo, callData),
    {
      onBuild: (op) => console.log("Signed UserOperation:", op),
    }
  );

  console.log(`UserOpHash: ${res.userOpHash}`);

  console.log("Waiting for transaction...");
  const ev = await res.wait();
  console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
}

// Example usage:
const tkn = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"; // tkn address
const s = "0xeb9e5ff948603c663cd8699f093cd5a1cd2d34be"; // Spender address
const amt = "20000000000"; // Amount to approve
const opts = { dryRun: false, withPM: false };

main(tkn, s, amt, opts);
