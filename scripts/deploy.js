const hre = require("hardhat");

async function main() {
  console.log("Deploying PrediChain contracts to BNB Chain...");

  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy OracleAdapter
  console.log("\n1. Deploying OracleAdapter...");
  const OracleAdapter = await hre.ethers.getContractFactory("OracleAdapter");
  const oracleAdapter = await OracleAdapter.deploy();
  await oracleAdapter.waitForDeployment();
  const oracleAdapterAddress = await oracleAdapter.getAddress();
  console.log("OracleAdapter deployed to:", oracleAdapterAddress);

  // Deploy Treasury
  console.log("\n2. Deploying Treasury...");
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("Treasury deployed to:", treasuryAddress);

  // Deploy PredictionMarket
  console.log("\n3. Deploying PredictionMarket...");
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy(oracleAdapterAddress, treasuryAddress);
  await predictionMarket.waitForDeployment();
  const predictionMarketAddress = await predictionMarket.getAddress();
  console.log("PredictionMarket deployed to:", predictionMarketAddress);

  // Transfer ownership of OracleAdapter and Treasury to PredictionMarket (or keep as deployer)
  // For MVP, we'll keep deployer as owner for oracle updates

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("OracleAdapter:", oracleAdapterAddress);
  console.log("Treasury:", treasuryAddress);
  console.log("PredictionMarket:", predictionMarketAddress);
  console.log("\nNext steps:");
  console.log("1. Verify contracts on BSCScan");
  console.log("2. Update frontend with contract addresses");
  console.log("3. Set up oracle price feeds");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      OracleAdapter: oracleAdapterAddress,
      Treasury: treasuryAddress,
      PredictionMarket: predictionMarketAddress,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\nDeployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

