const GadgetsContract = artifacts.require('./GadgetsContract.sol')

contract('GadgetsContract', ([account, seller, buyer]) => {
    let gadgetsContract;
    console.log("account " + account);
    console.log("seller " + seller);
    console.log("buyer " + buyer);

    before(async () => {
        // Retreive the deployed contract
        gadgetsContract = await GadgetsContract.deployed()
    });

    describe('deployment', async () => {
        it('deploys successfully, address check verified', async () => {
            // Get the first account
            console.log("First account = " + account);
            //get the address and verify
            const address = await gadgetsContract.address
            console.log(address);
            //not equal to 0 and not empty and not null nor not undefined
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '');
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
        // verify the name of the company
        it('verify the company name', async () => {
            const name = await gadgetsContract.getCompanyName();
            assert.equal(name, "ChainTech Gadgets");
        })

        it(`verify if the gadget count is 0`, async () => {
            const gadgetCount = await gadgetsContract.getNoOfGadgets();
            assert.equal(gadgetCount, 0);
        })
    })

    describe('Gadgets management', async () => {
        let result, gadgetCount

        before(async () => {
            // Add a new gadget before running the tests
            result = await gadgetsContract.addGadget(
                'SuperPhone X',
                'superphone_x.jpg',
                '256GB',
                '6 Inch',
                'Black',
                'Smartphone',
                'SuperBrand',
                web3.utils.toWei('0.5', 'Ether'),
                { from: seller }
            );
            gadgetCount = await gadgetsContract.getNoOfGadgets();
            console.log(gadgetCount)
        })

        it('allows a seller to add a gadget and increments gadgetCount', async () => {
            // Check that the gadget count has incremented by 1
            assert.equal(gadgetCount.toNumber(), 1, 'gadget count should be 1');
        });

        it('records the correct gadgetName', async () => {
            const event = result.logs[0].args // Stores all the events
            console.log("Result data " + event);
            console.log(event.gadgetName);
            assert.equal(event.gadgetName, 'SuperPhone X', 'gadgetName is correct');
        });

        it('records the correct storageSpace', async () => {
            const event = result.logs[0].args
            assert.equal(event.storageSpace, '256GB', 'storageSpace is correct');
        });

        it('records the correct screenSize', async () => {
            const event = result.logs[0].args
            assert.equal(event.screenSize, '6 Inch', 'screenSize is correct');
        });

        it('records the correct gadgetColour', async () => {
            const event = result.logs[0].args
            assert.equal(event.gadgetColour, 'Black', 'gadgetColour is correct');
        });

        it('records the correct gadgetCategory', async () => {
            const event = result.logs[0].args
            assert.equal(event.gadgetCategory, 'Smartphone', 'gadgetCategory is correct');
        });

        it('records the correct gadgetBrand', async () => {
            const event = result.logs[0].args
            assert.equal(event.gadgetBrand, 'SuperBrand', 'gadgetBrand is correct');
        });

        it('records the correct price', async () => {
            const event = result.logs[0].args
            assert.equal(event.price, web3.utils.toWei('0.5', 'Ether'), 'price is correct');
        });
    });

    describe('purchase gadgets', async () => {
        let event;
        let gadgetCost = 1;

        it('verifying seller & buyer balance', async () => {
            buyerBalance = await web3.eth.getBalance(buyer)
            buyerBalanceEth = web3.utils.fromWei(buyerBalance, 'ether');
            console.log("buyer balance " + buyerBalanceEth);

            sellerBalance = await web3.eth.getBalance(seller)
            sellerBalanceEth = web3.utils.fromWei(sellerBalance, 'ether');
            console.log("seller balance" + sellerBalanceEth);

            assert(buyerBalance > gadgetCost)
        });


        it('purchase gadget and check if buyer is the owner', async () => {
            // SUCCESS: Buyer makes purchase
            const gadgetCount = await gadgetsContract.getNoOfGadgets();
            assert(gadgetCount > 0, "No gadgets available for purchase.");

            gadgetCostString = gadgetCost.toString();
            result = await gadgetsContract.purchaseGadget(gadgetCount,
                { from: buyer, value: web3.utils.toWei(gadgetCostString, 'Ether') })



            console.log("output of purchase gadget");
            event = result.logs[0].args
            console.log(event);
            console.log(event.owner);

            assert.equal(event.owner, buyer, 'owner is correct')
        });

        it('purchase gadget and check if buyer is the owner and gadget status is Sold', async () => {
            console.log(result.logs);
            console.log(event.status);
            console.log(web3.utils.BN(event.status).toString());
            let status = web3.utils.BN(event.status).toString();
            assert.equal(status, 0, 'gadget status is correct')
        });


        it('verify seller balance after sales', async () => {

            let currentSellerBal = await web3.eth.getBalance(seller)

            currentSellerBalEth = web3.utils.fromWei(currentSellerBal, 'ether');

            currentSellerBalEthP = parseInt(currentSellerBalEth, 10);
            console.log("currentSellerBalEthP = " + currentSellerBalEthP);

            let sellerBalanceEthP = parseInt(sellerBalanceEth, 10);
            let expectedSellerBal = sellerBalanceEthP + gadgetCost;
            console.log("sellerBalanceEthP = " + sellerBalanceEthP);

            console.log("expectedSellerBal = " + expectedSellerBal);

            assert.equal(expectedSellerBal.toString(), currentSellerBalEthP.toString())
        })

        it('verify if the current buyer balance is equal to the expected buyer balance ', async () => {

            let currentBuyerBal = await web3.eth.getBalance(buyer)
            currentBuyerBalEth = web3.utils.fromWei(currentBuyerBal, 'ether');
            currentBuyerBalEthP = parseInt(currentBuyerBalEth, 10);
            console.log("currentBuyerBalEthP = " + currentBuyerBalEthP);

            let buyerBalanceEthP = parseInt(buyerBalanceEth, 10);
            let expectedBuyerBal = buyerBalanceEthP - gadgetCost;
            console.log("buyerBalanceEthP = " + buyerBalanceEthP);

            console.log("expectedBuyerBal = " + expectedBuyerBal);

            assert.equal(expectedBuyerBal.toString(), currentBuyerBalEthP.toString())
        })
    })
    console.log(buyer);
});