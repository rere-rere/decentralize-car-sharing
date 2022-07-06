
/**
 * 
 * autogenerated by solidity-visual-auditor
 * 
 * execute with: 
 *  #> truffle test <path/to/this/test.js>
 * 
 * */
var Rent = artifacts.require("../contracts/Rent.sol");
var CarFactory = artifacts.require("../contracts/CarFactory.sol");


contract('Rent', (accounts) => {
    var creatorAddress = accounts[0];

    var firstOwnerAddress = accounts[1];
    var secondOwnerAddress = accounts[2];
    var externalAddress = accounts[3];
    var unprivilegedAddress = accounts[4]
    /* create named accounts for contract roles */

    before(async () => {
        /* before tests */
    })
    
    beforeEach(async () => {
        /* before each context */
    })

    it('should revert if ...', () => {
        return Rent.deployed()
            .then(instance => {
                return instance.publicOrExternalContractMethod(argument1, argument2, {from:externalAddress});
            })
            .then(result => {
                assert.fail();
            })
            .catch(error => {
                assert.notEqual(error.message, "assert.fail()", "Reason ...");
            });
        });

    context('testgroup - security tests - description...', () => {
        
        let carFactory;
        let rent;

        const carOwnerAddress = firstOwnerAddress; 
        let carId;

        //deploy a new contract
        before(async () => {
            /* before tests */

            // Create a car for the example
            carFactory = await CarFactory.new()
            var transaction = await carFactory.createCar(
                "Renault Twingo",
                "Citadine",
                "Vehicule",
                "Diesel",
                "Manuelle",
                100000,
                2012,
                3,
                4,
                {from:carOwnerAddress}
            );

            // Get the car id created
            carId = transaction.logs[0].args.carId.toNumber();
        })
        
        beforeEach(async () => {
            /* before each tests */
            rent = await Rent.new();
        })

        it('checks creation of a rent contract', async () => {

            let client = secondOwnerAddress;
            let price = 10;
            let latitude = 48856614;
            let longitude = 23522219;
            let starting_date = new Date().getTime();
            let ending_date = new Date();
            ending_date.setDate(ending_date.getDay() + 5);
            ending_date = ending_date.getTime();

            // The client made a reservation
            var transaction = await rent.createRent(
                carOwnerAddress,
                carId,
                client, 
                price, 
                [latitude, longitude, starting_date, ending_date],
                {from: client}
            )

            // Verify that we receive the transaction
            assert.isTrue(transaction.receipt.status);

            // Check the logs
            assert.equal(transaction.logs[0].event, "NewRentProposition");
            assert.equal(transaction.logs[0].args.rentId.toNumber(), 0);
            assert.equal(transaction.logs[0].args.owner, carOwnerAddress);
            assert.equal(transaction.logs[0].args.client, client);

            let rentId = transaction.logs[0].args.rentId.toNumber();

            // Check the access variables
            let rentContractOwner  = await rent.rentToOwner.call(rentId);
            let rentContractClient = await rent.rentToClient.call(rentId);

            assert.equal(rentContractOwner, carOwnerAddress);
            assert.equal(rentContractClient, client);

            // Check the content of the created rent contract
            let createdRent = await rent.rentContract.call(0);
            
            assert.equal(createdRent[0], carOwnerAddress);
            assert.equal(createdRent[1], client);
            assert.equal(createdRent[2], carId);
            assert.equal(createdRent[3], price);
            assert.equal(createdRent[4][0], latitude);
            assert.equal(createdRent[4][1], longitude);
            assert.equal(createdRent[4][2], starting_date);
            assert.equal(createdRent[4][3], ending_date);
            assert.equal(createdRent[5], false);
            assert.equal(createdRent[6], false);
            assert.equal(createdRent[7], false);

        })


    })
});