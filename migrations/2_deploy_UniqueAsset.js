const uniqueAsset = artifacts.require("uniqueAsset");

module.exports = function (deployer) {
  deployer.deploy(uniqueAsset);
};