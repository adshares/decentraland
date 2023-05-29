# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Base placement without any side effect
- Plain placement with frame and include base placement
### Fixed
- Fix blinking banner
- Fix display placement when banner not found

## [2.2.0] - 2022-04-26
### Added
- UI placements support
### Fixed
- Creative is too close to background on plain placement

## [2.1.1] - 2022-04-25
### Fixed
- Fix citylight rotation system, when entity has no transform component
- Fix models & src folders

## [2.1.0] - 2022-03-27
### Added
- Stands support
- Totem, Citylight and Billboard stands
### Changed
- Build script

## [2.0.2] - 2022-03-07
### Fixed
- Remove entity from engine if exist

## [2.0.1] - 2022-03-03
### Fixed
- Adshares logo
- Error handling

## [2.0.0] - 2022-03-03
### Changed
- Code refactor
- Support for new AdServer API
### Removed
- Smart item code (moved to the separate project)

## [1.1.8] - 2022-11-08
### Fixed
- Less invasive error rendering

## [1.1.7] - 2022-06-20
### Changed
- New SDK version
- Builder compatibility
- Normalize ad server URL

## [1.1.6] - 2022-06-20
### Changed
- Fix scaling for nested ads
- Allow to customize screen material
- Video ad sound plays only after click
- Refresh ads periodically
- Support for `info_box` flag

## [1.1.5] - 2022-05-23
### Changed
- Remove dependency on dcl builder scripts

## [1.1.4] - 2022-04-25
### Changed
- Use signedFetch for logging events

## [1.1.3] - 2022-04-04
### Changed
- Npm package setup

## [1.1.2] - 2022-03-22
### Changed
- Add account and metamask to context

## [1.1.1] - 2022-03-15
### Fixed
- Optimize ads loading

## [1.1.0] - 2022-03-01
### Added
- Video ads support

[Unreleased]: https://github.com/adshares/decentraland/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/adshares/decentraland/compare/v2.1.1...2.2.0
[2.1.1]: https://github.com/adshares/decentraland/compare/v2.1.0...2.1.1
[2.1.0]: https://github.com/adshares/decentraland/compare/v2.0.2...2.1.0
[2.0.2]: https://github.com/adshares/decentraland/compare/v2.0.1...2.0.2
[2.0.1]: https://github.com/adshares/decentraland/compare/v2.0.0...2.0.1
[2.0.0]: https://github.com/adshares/decentraland/compare/v1.1.8...2.0.0
[1.1.8]: https://github.com/adshares/decentraland/compare/v1.1.7...1.1.8
[1.1.7]: https://github.com/adshares/decentraland/compare/v1.1.6...1.1.7
[1.1.6]: https://github.com/adshares/decentraland/compare/v1.1.5...1.1.6
[1.1.5]: https://github.com/adshares/decentraland/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/adshares/decentraland/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/adshares/decentraland/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/adshares/decentraland/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/adshares/decentraland/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/adshares/decentraland/releases/tag/v1.1.0
