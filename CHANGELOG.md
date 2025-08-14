# Changelog

## [1.2.0](https://github.com/iExecBlockchainComputing/PoCo-subgraph/compare/v1.1.0...v1.2.0) (2025-08-14)


### 🚀 Features

* add config for Arbitrum one deployment ([#54](https://github.com/iExecBlockchainComputing/PoCo-subgraph/issues/54)) ([a59e6fe](https://github.com/iExecBlockchainComputing/PoCo-subgraph/commit/a59e6fe49a182231a158fc12b95a7ebd867f9bbd))


### ✨ Polish

* remove ERC1538 references and update related configurations ([#52](https://github.com/iExecBlockchainComputing/PoCo-subgraph/issues/52)) ([5bf8680](https://github.com/iExecBlockchainComputing/PoCo-subgraph/commit/5bf86802e562251cc1acdb832b371fd87a2db8df))


### 🧰 Other

* **main:** release 2.0.0 ([#53](https://github.com/iExecBlockchainComputing/PoCo-subgraph/issues/53)) ([1d3d3f3](https://github.com/iExecBlockchainComputing/PoCo-subgraph/commit/1d3d3f353599ef37e3653922d43e5cace4aa2c98))
* Prepare release ([#56](https://github.com/iExecBlockchainComputing/PoCo-subgraph/issues/56)) ([eb7355b](https://github.com/iExecBlockchainComputing/PoCo-subgraph/commit/eb7355be4b14cd83623b7f71fe341282d54ec037))

## [2.0.0](https://github.com/iExecBlockchainComputing/PoCo-subgraph/compare/v1.1.0...v2.0.0) (2025-07-30)

### Added

- Add Arbitrum & Avalanche networks. (#47)
- Add a modern test stack, agnostic to the forked network. (#38)
- Add a section in the README to explain how to use the Docker-based subgraph deployer. (#38)

### Changed

- [BREAKING] Remove ERC1538 references and update related configurations (#52)
- Migrate integration tests from Jenkins to GitHub Actions. (#44)
- Remove unused files to streamline the repository. (#42)
- Rewrite Jenkins CI for future migration (#36, #37)

## v1.1.0 - Support deal sponsor

- Add `sponsor` to `deal`. (#31)
- Update deployment hosts:
  - production (#30)
  - staging (#29)
- Display coverage in Github PR checks. (#26)
- Add integration test suite. (#21)
- Add unit test suite. (#20)

## v1.0.0 - initial release

### features

- index iExec PoCo v5.3.0 `@iexec/poco@5.3.0`
- chains `mainnet`, `viviani`, `bellecour`, `goerli`, `rinkeby`, local chain with PoCo
- iExec enterprise version
