const _version =
  // when deploying
  process.env.npm_package_version ??
  // when deployed
  process.env.SERVICE_VERSION

if (_version === undefined) throw new Error('_version is undefined')

export const version = _version
