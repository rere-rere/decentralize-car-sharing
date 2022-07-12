
/**
 * 
 * autogenerated by solidity-visual-auditor
 * 
 * execute with: 
 *  #> truffle test <path/to/this/test.js>
 * 
 * */
var Web3 = require('web3');

var Rent = artifacts.require("../contracts/rental/RentalContract.sol");
var Verifier = artifacts.require("../contracts/Verifier.sol");
var CarFactory = artifacts.require("../contracts/CarFactory.sol");


contract('Rent', (accounts) => {
    var creatorAddress = accounts[0];

    var firstOwnerAddress = accounts[1];
    var secondOwnerAddress = accounts[2];
    var externalAddress = accounts[3];
    var unprivilegedAddress = accounts[4]


    let verifier;
    let carFactory;

    const carOwnerAddress = firstOwnerAddress;
    let carId;

    before(async () => {
        // Create the Verifier contract
        verifier = await Verifier.new()

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
            { from: carOwnerAddress }
        );

        // Get the car id created
        carId = transaction.logs[0].args.carId.toNumber();
    })

    beforeEach(async () => {
        /* before each context */
    })

    context('test the creation of a rental agreement proposal', () => {

        let rent;

        let client;
        let price;
        let latitude;
        let longitude;
        let starting_date;
        let ending_date;

        before(async () => {
            /* before tests */
            client = secondOwnerAddress;
            price = 10;
            latitude = 48856614;
            longitude = 23522219;
            starting_date = new Date().getTime();
            ending_date = new Date();
            ending_date.setDate(ending_date.getDay() + 5);
            ending_date = ending_date.getTime();
        })

        beforeEach(async () => {
            /* before each tests */
            rent = await Rent.new(verifier.address, carFactory.address);
        })

        it('checks creation of a rent contract', async () => {

            // The client made a reservation
            var transaction = await rent.createRent(
                carOwnerAddress,
                carId,
                client,
                price,
                [latitude, longitude, starting_date, ending_date],
                { from: client }
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
            let rentContractOwner = await rent.rentToOwner.call(rentId);
            let rentContractClient = await rent.rentToClient.call(rentId);

            assert.equal(rentContractOwner, carOwnerAddress);
            assert.equal(rentContractClient, client);

            // Check the content of the created rent contract
            let createdRent = await rent.rentContract.call(0);

            assert.equal(createdRent[0], carOwnerAddress);
            assert.equal(createdRent[1], client);
            assert.equal(createdRent[2], carId);
            assert.equal(createdRent[3], price);
            
            // Correspond to the timestamps of the booked rental (should be at the creation equals to 0)
            assert.equal(createdRent[4], 0);

            assert.equal(createdRent[5][0], latitude);
            assert.equal(createdRent[5][1], longitude);
            assert.equal(createdRent[5][2], starting_date);
            assert.equal(createdRent[5][3], ending_date);
            
            assert.isTrue(createdRent[6]);
            assert.isFalse(createdRent[7]);
            
            assert.equal(createdRent[8], 0);

        })


        it('checks that the carOwner of the address should owned the car', async () => {

            // Make a reservation with the bad address of the owner
            try {   
                var transaction = await rent.createRent(
                    client,
                    carId,
                    client,
                    price,
                    [latitude, longitude, starting_date, ending_date],
                    { from: client }
                )
                assert.fail("The transaction should have thrown an error");
            } catch (error) {
                assert.include(error.message, "revert", "The error message should contain 'revert'");
            }
        })

    })


    context('test the approval of the rental agreement proposal', () => {

        let rent;
        let rentId;

        beforeEach(async () => {
            rent = await Rent.new(verifier.address, carFactory.address);

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
                { from: client }
            )

            rentId = transaction.logs[0].args.rentId.toNumber();
        })

        it('checks the approval of the owner', async () => {

            // TODO :: Define a encrypted secret
            let secret = Web3.utils.asciiToHex("999 859 487");

            let transaction = await rent.approved(rentId, secret, { from: carOwnerAddress });

            // Verify that we receive the transaction
            assert.isTrue(transaction.receipt.status);

            // Check the logs
            assert.equal(transaction.logs[0].event, "ApproveRent");
            assert.equal(transaction.logs[0].args.rentId.toNumber(), rentId);
            assert.equal(transaction.logs[0].args.proposer, carOwnerAddress);

        })


    })
});
