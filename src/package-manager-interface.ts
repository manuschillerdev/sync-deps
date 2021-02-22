const { existsSync, readFileSync } = require("fs");
const { execSync } = require("child_process");
const path = require("path");

type SupportedPackageManagers = "yarn" | "npm" | "pnpm";

const installDependencies = (packageManagerName: SupportedPackageManagers) =>
  function () {
    console.log(`[sync-deps] found outdated dependencies - updating...`);
    execSync(`${packageManagerName} install`, { stdio: "inherit" });
  };

export const resolveFilenameToCwd = (filename: string): string =>
  path.resolve(process.cwd(), filename);

const lockfilePaths: Record<SupportedPackageManagers, string> = {
  yarn: resolveFilenameToCwd("yarn.lock"),
  npm: resolveFilenameToCwd("package-lock.json"),
  pnpm: resolveFilenameToCwd("pnpm-lock.yaml"),
};

interface PackageManager {
  getLockedVersion: (name: string, version: string) => string;
  install: () => void;
}

export function initPackageManagerInterface(): PackageManager | undefined {
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
