# CKBuilder Weekly Report — Week 1

## 1. Weekly Focus

This week, I started the CKBuilder onboarding process and focused on setting up a local CKB development environment with OffCKB.

## 2. What I Completed

- Read and followed the official CKB Quick Start guide.
- Installed OffCKB 0.4.13.
- Started a local CKB Devnet.
- Deployed the `hello-world.bc` test contract.
- Confirmed that the deployment transaction was committed.
- Ran the included tests successfully.
- Created a public GitHub repository for documenting my CKBuilder learning.
- Shared the repository link and completion screenshot with the CKBuilder coordinator, Neon.

## 3. Technical Results

- Node.js: v22.22.2
- npm: 10.9.7
- OffCKB: 0.4.13
- Devnet RPC: 8114
- Devnet Proxy: 28114
- Contract: `hello-world.bc`
- Deployment status: `tx committed`
- Tests: 2 suites passed, 2 tests passed
- Local deployment transaction hash:
  `0x6b50682bdb8bbca98390679251eca244c36d69e418b9c6ec2931082faa8e07ee`

This transaction was deployed on a local Devnet, so it does not have a public block explorer URL.

## 4. Evidence

- GitHub repository:
  https://github.com/0xClareYang/ckbuilder
- OffCKB onboarding screenshot:
  [View evidence](../evidence/offckb-onboarding-success.png)

## 5. Problems and Solutions

The initial Devnet terminal session exited before the first deployment attempt, which caused a `fetch failed` error because the local RPC and proxy ports were no longer listening. I restarted `offckb node`, waited for the Devnet to become ready, verified the local RPC and then deployed the contract successfully without cleaning the chain data.

On Intel macOS, the latest `ckb-debugger` release did not provide a compatible prebuilt binary. I used the compatible official `ckb-standalone-debugger` v1.0.0 release for Intel macOS and verified its checksum before installing it in OffCKB's user-level tool directory.

## 6. What I Learned

I gained an initial understanding of how OffCKB provides a local development environment for CKB. I also learned the basic workflow of starting a Devnet, deploying a test contract, confirming transaction status and preserving evidence of the process.

My current understanding is still introductory. I have not yet developed a sufficiently detailed understanding of the Cell Model or CKB-VM, so those will be the focus of the next stage.

## 7. Plan for Next Week

- Study the basic concepts behind the CKB Cell Model.
- Understand the difference between live cells and consumed cells.
- Review the role of CKB-VM and scripts in transaction validation.
- Complete one additional practical transaction or data-storage exercise.
- Record commands, screenshots, errors and solutions in this repository.
- Explore how these concepts relate to Fiber and payment use cases.
