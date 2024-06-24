const { Web3 } = require("web3");
const fs = require("fs");

const { abi, bytecode } = JSON.parse(fs.readFileSync("build/contracts/GadgetsContract.json"));

async function main() {
  const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545")); // Assuming Ganache runs on the default URL

  try {
    const accounts = await web3.eth.getAccounts();
    const signer = web3.eth.accounts.privateKeyToAccount(process.env.SIGNER_PRIVATE_KEY_GANACHE,);

    console.log('Signer Address:', signer.address);

    const balanceWei = await web3.eth.getBalance(signer.address);
    console.log(`${balanceWei} WEI`);

    const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
    console.log(`${balanceEth} ETH`);

    web3.eth.accounts.wallet.add(signer);

    const contract = new web3.eth.Contract(abi);
    contract.options.data = bytecode;

    const deployTx = contract.deploy();
    const gasEstimate = await deployTx.estimateGas();

    const gadgetsContract = await deployTx.send({
      from: signer.address,
      gas: gasEstimate,
    });

    console.log(`Contract deployed at ${gadgetsContract.options.address}`);

    const companyName = await gadgetsContract.methods.getCompanyName().call();
    console.log(`Company Name: ${companyName}`);

    const noOfGadgets = await gadgetsContract.methods.getNoOfGadgets().call();
    console.log(`No of Gadgets: ${noOfGadgets}`);

    const gasAmountEstimate = await gadgetsContract.methods
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
      .estimateGas({ from: accounts[0] }); // Use the first account from Ganache

    console.log('Gas Amount Estimate:', gasAmountEstimate);

    const receipt = await gadgetsContract.methods
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
        from: accounts[4], // Use the first account from Ganache
        gas: 560000,
      });

    console.log('Transaction Receipt:', receipt);

    const updatedNoOfGadgets = await gadgetsContract.methods.getNoOfGadgets().call();
    console.log('Updated No of Gadgets:', updatedNoOfGadgets);
  } catch (error) {
    console.error('Error:', error);
  }
}

require('dotenv').config();
main();