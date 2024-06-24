const GadgetsContract = artifacts.require("GadgetsContract");

module.exports = function (deployer) {
  deployer.deploy(GadgetsContract);
};