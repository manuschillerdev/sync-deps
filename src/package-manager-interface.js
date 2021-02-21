// @ts-check
const { existsSync, readFileSync } = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const installDependencies = (packageManagerName) => () => {
  console.log(`[sync-deps] found outdated dependencies - updating...`);
  execSync(`${packageManagerName} install`, { stdio: "inherit" });
};

const resolveCwd = (filename) => path.resolve(process.cwd(), filename)

const lockfilePaths = {
  yarn: resolveCwd("yarn.lock"),
  npm: resolveCwd("package-lock.json"),
  pnpm: resolveCwd("pnpm-lock.yaml"),
};

/**
 * Parses a lockfile for yarn, npm or pnpm and returns the interface to
 * check locked versions and to install dependencies.
 *
 * @returns {PackageManager | undefined}
 */
function initPackageManagerInterface() {
  // YARN
  if (existsSync(lockfilePaths.yarn)) {
    const { parse } = require("@yarnpkg/lockfile");
    const { readFileSync } = require("fs");

    const parsedLockfile = parse(readFileSync(lockfilePaths.yarn, "utf8"));
    const lockedDependencies = parsedLockfile.object;

    return {
      getLockedVersion: (name, version) =>
        lockedDependencies[`${name}@${version}`]?.version,
      install: installDependencies("yarn"),
    };
  }

  // NPM
  else if (existsSync(lockfilePaths.npm)) {
    const parsedLockfile = require(lockfilePaths.npm);
    const lockedDependencies = parsedLockfile.dependencies;

    return {
      getLockedVersion: (name) => lockedDependencies[name]?.version,
      install: installDependencies("npm"),
    };
  }

  // PNPM
  else if (existsSync(lockfilePaths.pnpm)) {
    const { load } = require("js-yaml");

    const parsedLockfile = load(readFileSync(lockfilePaths.pnpm, "utf8"));
    const lockedDependencies = {
      ...(parsedLockfile.dependencies || {}),
      ...(parsedLockfile.devDependencies || {}),
    };

    return {
      getLockedVersion: (name) => lockedDependencies[name],
      install: installDependencies("pnpm"),
    };
  }
}

exports.initPackageManagerInterface = initPackageManagerInterface;
