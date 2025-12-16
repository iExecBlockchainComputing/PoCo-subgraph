# Changelog

## [2.1.2](https://github.com/iExecBlockchainComputing/PoCo-subgraph/compare/v2.1.1...v2.1.2) (2025-12-16)


### 🐞 Bug Fixes

* allow updating start block with START_BLOCK env ([#67](https://github.com/iExecBlockchainComputing/PoCo-subgraph/issues/67)) ([0794cf8](https://github.com/iExecBlockchainComputing/PoCo-subgraph/commit/0794cf86a4af314eac9d78b74c31c307a4421f5c))

## [2.1.1](https://github.com/iExecBlockchainComputing/PoCo-subgraph/compare/v2.1.0...v2.1.1) (2025-11-10)


### 🐞 Bug Fixes

* add missing fi statement and rename published image ([#64](https://github.com/iExecBlockchainComputing/PoCo-subgraph/issues/64)) ([adce9d6](https://github.com/iExecBlockchainComputing/PoCo-subgraph/commit/adce9d6864b343b8651b1d711d06d98e8aa6a445))
* deployment ci for `bellecour` network ([#61](https://github.com/iExecBlockchainComputing/PoCo-subgraph/issues/61)) ([19d7658](https://github.com/iExecBlockchainComputing/PoCo-subgraph/commit/19d76589435cc081cabb612e2436c47a8bb774a6))
* deployment scripts for consistency with versioning ([#63](https://github.com/iExecBlockchainComputing/PoCo-subgraph/issues/63)) ([7b1c57c](https://github.com/iExecBlockchainComputing/PoCo-subgraph/commit/7b1c57c9cfc09b1e72cbad0ef4ff618263a93a79))
* format code ([#65](https://github.com/iExecBlockchainComputing/PoCo-subgraph/issues/65)) ([068fe2a](https://github.com/iExecBlockchainComputing/PoCo-subgraph/commit/068fe2a128ef672cf164578888337f81fa75348b))
* update deployment environment option from 'production' to 'prod' ([#66](https://github.com/iExecBlockchainComputing/PoCo-subgraph/issues/66)) ([d9cc130](https://github.com/iExecBlockchainComputing/PoCo-subgraph/commit/d9cc1306f068e71237f7b16dd8147d2e34fa83e7))

## [2.1.0](https://github.com/iExecBlockchainComputing/PoCo-subgraph/compare/v2.0.0...v2.1.0) (2025-10-29)


### 🚀 Features

* add unit tests for Bulk and BulkSlice entities ([#59](https://github.com/iExecBlockchainComputing/PoCo-subgraph/issues/59)) ([a10d31f](https://github.com/iExecBlockchainComputing/PoCo-subgraph/commit/a10d31ffdc02de22b5ac768cb701fab5d2ad43be))
* add usage tracking for `app` and `workerpool` ([#60](https://github.com/iExecBlockchainComputing/PoCo-subgraph/issues/60)) ([c7a2ad3](https://github.com/iExecBlockchainComputing/PoCo-subgraph/commit/c7a2ad30ae7124cd1efda74da6b08e8069ec524c))
* index bulks ([#57](https://github.com/iExecBlockchainComputing/PoCo-subgraph/issues/57)) ([0462170](https://github.com/iExecBlockchainComputing/PoCo-subgraph/commit/0462170920a58416a2dc4260e1528e0e88adc036))

## [2.0.0](https://github.com/iExecBlockchainComputing/PoCo-subgraph/compare/v1.1.0...v2.0.0) (2025-08-14)

### 🚀 Changes

* Add config for Arbitrum one deployment (#54)
* [BREAKING] Remove ERC1538 references and update related configurations (#52)
* Add Arbitrum & Avalanche networks. (#47)
* Migrate integration tests from Jenkins to GitHub Actions. (#44)
* Remove unused files to streamline the repository. (#42)
* Add a modern test stack, agnostic to the forked network. (#38)
* Add a section in the README to explain how to use the Docker-based subgraph deployer. (#38)
* Rewrite Jenkins CI for future migration (#36, #37)

## v1.1.0 - Support deal sponsor

* Add `sponsor` to `deal`. (#31)
* Update deployment hosts:
  * production (#30)
  * staging (#29)
* Display coverage in Github PR checks. (#26)
* Add integration test suite. (#21)
* Add unit test suite. (#20)

## v1.0.0 - initial release

### features

* index iExec PoCo v5.3.0 `@iexec/poco@5.3.0`
* chains `mainnet`, `viviani`, `bellecour`, `goerli`, `rinkeby`, local chain with PoCo
* iExec enterprise version
