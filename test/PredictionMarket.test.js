const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrediChain Contracts", function () {
  let oracleAdapter, treasury, predictionMarket;
  let owner, user1, user2;
  let marketId;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy OracleAdapter
    const OracleAdapter = await ethers.getContractFactory("OracleAdapter");
    oracleAdapter = await OracleAdapter.deploy();
    await oracleAdapter.waitForDeployment();

    // Deploy Treasury
    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy();
    await treasury.waitForDeployment();

    // Deploy PredictionMarket
    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    predictionMarket = await PredictionMarket.deploy(
      await oracleAdapter.getAddress(),
      await treasury.getAddress()
    );
    await predictionMarket.waitForDeployment();

    // Update oracle with test price
    await oracleAdapter.updatePrice("BTC", ethers.parseEther("50000")); // $50,000
  });

  describe("Market Creation", function () {
    it("Should create a new market", async function () {
      const question = "Will BTC price exceed $100,000 by Nov 18, 2025?";
      const asset = "BTC";
      const targetPrice = ethers.parseEther("100000");
      const resolutionTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

      const tx = await predictionMarket.createMarket(
        question,
        asset,
        targetPrice,
        resolutionTime
      );
      const receipt = await tx.wait();

      // Get market ID from event
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "MarketCreated"
      );
      expect(event).to.not.be.undefined;

      marketId = 1;
      const market = await predictionMarket.getMarket(marketId);
      expect(market.question).to.equal(question);
      expect(market.asset).to.equal(asset);
      expect(market.targetPrice).to.equal(targetPrice);
      expect(market.creator).to.equal(owner.address);
    });

    it("Should reject invalid market creation", async function () {
      await expect(
        predictionMarket.createMarket("", "BTC", ethers.parseEther("100000"), Math.floor(Date.now() / 1000) + 86400)
      ).to.be.revertedWith("PredictionMarket: Invalid question");

      await expect(
        predictionMarket.createMarket(
          "Test",
          "BTC",
          ethers.parseEther("100000"),
          Math.floor(Date.now() / 1000) - 86400 // Past time
        )
      ).to.be.revertedWith("PredictionMarket: Invalid resolution time");
    });
  });

  describe("Trading", function () {
    beforeEach(async function () {
      // Create a market first
      const resolutionTime = Math.floor(Date.now() / 1000) + 86400;
      await predictionMarket.createMarket(
        "Will BTC price exceed $100,000 by Nov 18, 2025?",
        "BTC",
        ethers.parseEther("100000"),
        resolutionTime
      );
      marketId = 1;
    });

    it("Should allow buying a position", async function () {
      const tradeAmount = ethers.parseEther("0.1");
      const fee = (tradeAmount * 200n) / 10000n; // 2% fee

      await expect(
        predictionMarket.connect(user1).buyPosition(marketId, true, { value: tradeAmount })
      ).to.emit(predictionMarket, "PositionTraded");

      const position = await predictionMarket.getPosition(marketId, user1.address);
      expect(position.amount).to.be.gt(0);
      expect(position.side).to.be.true;
    });

    it("Should collect trading fees", async function () {
      const tradeAmount = ethers.parseEther("0.1");
      const fee = (tradeAmount * 200n) / 10000n;

      await predictionMarket.connect(user1).buyPosition(marketId, true, { value: tradeAmount });

      const treasuryBalance = await treasury.getBalance();
      expect(treasuryBalance).to.equal(fee);
    });

    it("Should reject trading on expired markets", async function () {
      // Create market with near-future resolution time (5 seconds from now)
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const nearFutureTime = block.timestamp + 5; // 5 seconds from current block
      
      const tx = await predictionMarket.createMarket(
        "Expired Market",
        "BTC",
        ethers.parseEther("100000"),
        nearFutureTime
      );
      await tx.wait();

      // Wait for market to expire (6 seconds)
      await new Promise((resolve) => setTimeout(resolve, 6000));

      await expect(
        predictionMarket.connect(user1).buyPosition(2, true, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("PredictionMarket: Market expired");
    });
  });

  describe("Market Resolution", function () {
    beforeEach(async function () {
      // Create a market
      const resolutionTime = Math.floor(Date.now() / 1000) + 86400;
      await predictionMarket.createMarket(
        "Will BTC price exceed $100,000 by Nov 18, 2025?",
        "BTC",
        ethers.parseEther("100000"),
        resolutionTime
      );
      marketId = 1;
    });

    it("Should resolve market with oracle price", async function () {
      // Set BTC price to $110,000 (above target)
      await oracleAdapter.updatePrice("BTC", ethers.parseEther("110000"));

      // Create market with near-future resolution time (5 seconds from now)
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const resolutionTime = block.timestamp + 5; // 5 seconds from current block
      
      const tx = await predictionMarket.createMarket(
        "Test Market",
        "BTC",
        ethers.parseEther("100000"),
        resolutionTime
      );
      await tx.wait();

      // Wait for resolution time to pass (6 seconds)
      await new Promise((resolve) => setTimeout(resolve, 6000));

      // Resolve market
      await expect(predictionMarket.resolveMarket(2)).to.emit(
        predictionMarket,
        "MarketResolved"
      );

      const market = await predictionMarket.getMarket(2);
      expect(market.status).to.equal(1); // Resolved
      expect(market.outcome).to.be.true; // Price > target
    });
  });

  describe("Treasury", function () {
    it("Should collect fees", async function () {
      const feeAmount = ethers.parseEther("0.01");
      
      // Send fee to treasury
      await owner.sendTransaction({
        to: await treasury.getAddress(),
        value: feeAmount,
      });

      await treasury.collectFee(feeAmount);

      const totalFees = await treasury.totalFeesCollected();
      expect(totalFees).to.equal(feeAmount);
    });
  });
});

