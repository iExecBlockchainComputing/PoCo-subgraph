# Changelog

## vNEXT

- Add Arbitrum & Avalanche networks. (#47)
- Migrate integration tests from Jenkins to GitHub Actions. (#44)
- Remove unused files to streamline the repository. (#42)
- Rewrite Jenkins CI for future migration (#36, #37)
- Add a modern test stack, agnostic to the forked network. (#38)
- Add a section in the README to explain how to use the Docker-based subgraph deployer. (#38)

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
