// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GadgetsContract {
    enum gadgetStatus {
        Sold,
        Available
    }

    // Declared fields
    string companyName;
    uint gadgetCount;
    gadgetStatus currentGadgetStatus;

    // Mapping from ID to the relevant gadget deails
    mapping(uint => GadgetDetails) public listOfGadgets;

    // Structure / Information that consists in the gadget details
    struct GadgetDetails {
        uint gadgetId;
        string gadgetName;
        string gadgetPic;
        string storageSpace;
        string screenSize;
        string gadgetColour;
        string gadgetCategory;
        string gadgetBrand;
        uint price;
        address ownerId;
        gadgetStatus status;
    }

    struct ownerDetails {
        address ownerId;
        string firstName;
        string lastName;
        string mobileNo;
        string email;
    }

    constructor() {
        gadgetCount = 0;
        currentGadgetStatus = gadgetStatus.Available;
        companyName = "ChainTech Gadgets";
    }

    event GadgetCreated(
        uint gadgetId,
        string gadgetName,
        string gadgetPic,
        string storageSpace,
        string screenSize,
        string gadgetColour,
        string gadgetCategory,
        string gadgetBrand,
        uint price,
        address ownerId,
        gadgetStatus status
    );

    event GadgetPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        gadgetStatus status
    );

    //Write a function addGadget with the relevant function parameters
    function addGadget(
        string memory _gadgetName,
        string memory _gadgetPic,
        string memory _storageSpace,
        string memory _screenSize,
        string memory _gadgetColour,
        string memory _gadgetCategory,
        string memory _gadgetBrand,
        uint _price
    ) public {
        incrementGadgetCount(); // For the purpose of initializing the id based on the current count of how many gadgets there are
        listOfGadgets[gadgetCount] = GadgetDetails(
            gadgetCount,
            _gadgetName,
            _gadgetPic,
            _storageSpace,
            _screenSize,
            _gadgetColour,
            _gadgetCategory,
            _gadgetBrand,
            _price, // this should be the price
            msg.sender,
            gadgetStatus.Available
        );
        emit GadgetCreated(gadgetCount,
            _gadgetName,
            _gadgetPic,
            _storageSpace,
            _screenSize,
            _gadgetColour,
            _gadgetCategory,
            _gadgetBrand,
            _price, // this should be the price
            msg.sender,
            gadgetStatus.Available);
    }

    // Retrieve Gadget details according to the index set for the relevant item
    function getGadgetDetails(
        uint index
    ) public view returns (GadgetDetails memory) {
        return listOfGadgets[index];
    }

    function getNoOfGadgets() public view returns (uint) {
        return gadgetCount;
    }

    function incrementGadgetCount() internal {
        gadgetCount++;
    }

    function getCompanyName() public view returns (string memory) {
        return companyName;
    }

    // Adding a function to purchase a gadget
    // Add this event at the top of your contract for debugging purposes
    event DebugLog(string message);

    function purchaseGadget(uint _id) public payable {
        // emit DebugLog("purchaseGadget called");
        GadgetDetails memory gadgetInfo = listOfGadgets[_id];

        // emit DebugLog("gadgetInfo fetched");
        address payable seller = payable(gadgetInfo.ownerId);

        require(
            gadgetInfo.gadgetId > 0 && gadgetInfo.gadgetId <= gadgetCount,
            "Invalid gadget ID"
        );
        // emit DebugLog("gadget ID is valid");

        require(msg.value >= gadgetInfo.price, "Not enough Ether sent");
        // emit DebugLog("sufficient Ether sent");

        require(
            gadgetInfo.status == gadgetStatus.Available,
            "Gadget not available"
        );
        // emit DebugLog("gadget is available");

        require(seller != msg.sender, "Buyer cannot be seller");
        // emit DebugLog("buyer is not seller");

        // The transfer of ownership and marking the gadget as sold
        gadgetInfo.ownerId = payable(msg.sender);
        gadgetInfo.status = gadgetStatus.Sold;
        listOfGadgets[_id] = gadgetInfo;
        // emit DebugLog("gadget ownership transferred and status updated");

        // Paying the seller
        payable(seller).transfer(msg.value);
        // emit DebugLog("seller paid");

        // Emitting the purchase event with the correct parameters
        emit GadgetPurchased(
            gadgetCount,
            gadgetInfo.gadgetName,
            gadgetInfo.price,
            payable(msg.sender),
            gadgetStatus.Sold
        );
        // emit DebugLog("GadgetPurchased event emitted");
    }
}