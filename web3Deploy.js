const { Web3 } = require("web3");

// Loading the contract ABI and Bytecode// (the results of a previous compilation step)
const fs = require("fs");
const { abi, bytecode } = JSON.parse(fs.readFileSync("build/contracts/GadgetsContract.json"));

// To check on the contract method for getCompanyName()
// const abiMethods = abi.map(func => func.name);
// console.log(abiMethods);

// // This should include 'getCompanyName' in the array of method names
// if (!abiMethods.includes('getCompanyName')) {
//   throw new Error('getCompanyName function not found in ABI');
// }

async function main() {
  // Configuring the connection to an Ethereum node
  const network = process.env.ETHEREUM_NETWORK;
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`,
    ),
  );
  // Creating a signing account from a private key
  const signer = web3.eth.accounts.privateKeyToAccount(
    process.env.SIGNER_PRIVATE_KEY,
  );
  // Obtain the balance of the account
  web3.eth.getBalance(process.env.PUBLIC_KEY, 'latest', (err, wei) => {
    console.log(wei + "WEI")
    balanceE = web3.utils.fromWei(wei, 'ether');
    console.log(balanceE + "ETH");
  })
  
  // Adding the signing account to the wallet
  web3.eth.accounts.wallet.add(signer);

  // Using the signing account to deploy the contract
  const contract = new web3.eth.Contract(abi);
  contract.options.data = bytecode;
  const deployTx = contract.deploy();

  // Estimate the gas required to deploy and add an extra amount
  const estimatedGas = BigInt(await deployTx.estimateGas({from: signer.address }));
  const gasBuffer = estimatedGas * BigInt(5);
  const gasLimit = estimatedGas + gasBuffer;

  // Fetch the current gas price from the network
  const gasPrice = await web3.eth.getGasPrice();

  const deployedContract = await deployTx
    .send({
      from: signer.address,
      // gas: await deployTx.estimateGas(),
      gas: gasLimit.toString(),
      gasPrice: gasPrice, // Doing the setting for the gas price
    })
    .once("transactionHash", (txhash) => {
      console.log(`Mining deployment transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
  // The contract is now deployed on chain!
  console.log(`Contract deployed at ${deployedContract.options.address}`);
  const companyName = await deployedContract.methods.getCompanyName().call();
  console.log(`Company Name: ${companyName}`);
  const noOfGadgets = await deployedContract.methods.getNoOfGadgets().call();
  console.log(`No of Gadgets: ${noOfGadgets}`);

  // newly added code
  deployedContract.methods.addGadget('Thinkpad T14',
    'thinkpad_t14_laptop.jpg',
    '256GB',
    '14" Inch Display',
    'Black',
    'Laptop',
    'Thinkpad Lenovo',
    web3.utils.toWei('1', 'ether')).estimateGas(
      { from: process.env.PUBLIC_KEY }).then(function (gasAmount) {
        console.log("gas Amount" + gasAmount);
      });

  const receipt = await deployedContract.methods
    .addGadget(
      'Thinkpad T14',
      'thinkpad_t14_laptop.jpg',
      '256GB',
      '14" Inch Display',
      'Black',
      'Laptop',
      'Thinkpad Lenovo',
      web3.utils.toWei('1', 'ether')
    )
    .send({
      from: process.env.PUBLIC_KEY,
      gas: 560000,
    });

  console.log('Transaction Receipt:', receipt);
  const updatedNoOfGadgets = await deployedContract.methods.getNoOfGadgets().call();
  console.log('Updated No of Gadgets:', updatedNoOfGadgets);
}

require("dotenv").config();
main();
