const { ethers } = require("ethers");
const { Client, Presets } = require("userop");
const { Web3 } = require("web3");

async function getData() {
  // const provider = new Web3(process.env.web3);
  const provider = {
    _isProvider: true,
    _events: [],
    _emitted: { block: -2 },
    disableCcipRead: false,
    formatter: {
      formats: {
        transaction: {},
        transactionRequest: {},
        receiptLog: {},
        receipt: {},
        block: {},
        blockWithTransactions: {},
        filter: {},
        filterLog: {},
      },
    },
    anyNetwork: false,
    _networkPromise: {},
    _maxInternalBlockNumber: -1024,
    _lastBlockNumber: -2,
    _maxFilterBlockRange: 10,
    _pollingInterval: 4000,
    _fastQueryDate: 0,
    connection: { url: "metamask" },
    _nextId: 42,
    provider: {
      _events: {},
      _eventsCount: 0,
      _maxListeners: 100,
      isMetaMask: true,
      selectedAddress: "0x541d400a901d71a65c5f2e365e86814215618de3",
      networkVersion: "137",
      chainId: "0x89",
    },
  };
  //const provider = new ethers.providers.Web3Provider({ ethereum1 });
  const signerAddress = process.env.signerAddress;
  const signer = provider.getSigner(signerAddress);

  const _simpleAccount = await Presets.Builder.SimpleAccount.init(
    signer,
    process.env.REACT_APP_RPC_URL,
    process.env.REACT_APP_ENTRY_POINT,
    process.env.REACT_APP_SIMPLE_ACCOUNT_FACTORY
  );

  const smartContract = _simpleAccount.getSender();

  console.log("signer: " + signer);
  console.log("smartContract: " + smartContract);
}

getData();
