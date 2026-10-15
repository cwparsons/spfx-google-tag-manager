# Changelog

## [0.7.0] - 2026-10-15

### Fixed

- Fix hashed user ID (`enableUserIdEncryption`) being sent as an `ArrayBuffer`
  instead of a hex string. Since 0.5.0, every user was sent the same value, which
  merged them into a single user in Google Analytics.
- Push the user ID to the `dataLayer` before the Google Tag Manager container
  loads, so tags firing on initialization or page view can read it.

## [0.6.0] - 2026-09-22

### Added

- Add a properties dialog, enabled with the `?spfx-google-tag-manager-properties=true`
  query string parameter, to edit the custom action's configuration such as the
  container ID.

### Changed

- Upgrade to SPFx 1.23.2 and the Heft build toolchain.
- Load the Google Tag Manager container script with `SPComponentLoader.loadScript`
  instead of an inline script. With Content Security Policy enforced, the Google
  Tag Manager domains must be added as trusted script sources (see README).
- Add npm `overrides` to resolve package audit warnings.

## [0.5.0] - 2024-02-02

### Changed

- Upgrade to SPFx 1.18.2.
- Replace `crypto-js` with the Web Crypto API for user ID hashing.
- Update GitHub workflows to build and release the package.

## [0.4.0] - 2021-03-02

### Add

- Add `enableUserId` and `enableUserIdEncryption` properties, functionality.

## [0.3.0] - 2021-02-25

### Change

- Move `NavigatedEvent` custom event to after `dataLayer` initialization.

## [0.2.0] - 2021-02-22

### Changed

- Refactor application customizer initializer to prevent loading the Google Tag Manager script multiple times.

## [0.1.0] - 2021-01-20

### Added

- Initial Google Tag Manager application customizer.
- Load Google Tag Manager script with a specific container ID.
