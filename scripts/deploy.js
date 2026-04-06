const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy MockUSDT
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy(deployer.address);
  await mockUSDT.deployed();
  console.log("✅ MockUSDT deployed to:", mockUSDT.address);

  // Deploy DiasporaPool
  const DiasporaPool = await ethers.getContractFactory("DiasporaPool");
  const diasporaPool = await DiasporaPool.deploy(mockUSDT.address, deployer.address);
  await diasporaPool.deployed();
  console.log("✅ DiasporaPool deployed to:", diasporaPool.address);

  // Log env vars to add to .env
  console.log("\n── Add these to your .env ──");
  console.log(`VITE_MOCK_USDT_ADDRESS=${mockUSDT.address}`);
  console.log(`VITE_DIASPORA_POOL_ADDRESS=${diasporaPool.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
