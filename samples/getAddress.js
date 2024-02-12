const { ethers } = require("ethers");
const { Presets } = require("userop"); // Assuming you have "userop" installed
const config = require("./config.json");

async function main() {
  try {
    const wallet = new ethers.Wallet(config.signingKey);
    console.log("wallet: " + JSON.stringify(wallet));
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    console.log("config.rpcUrl: " + config.rpcUrl);
    console.log("config.ENTRY_POINT: " + config.ENTRY_POINT);
    console.log(
      "config.SIMPLE_ACCOUNT_FACTORY: " + config.SIMPLE_ACCOUNT_FACTORY
    );

    const simpleAccount = await Presets.Builder.SimpleAccount.init(
      wallet,
      config.rpcUrl,
      config.ENTRY_POINT,
      config.SIMPLE_ACCOUNT_FACTORY
    );
    const address = simpleAccount.getSender();

    console.log(`samrt contract address: ${address}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
