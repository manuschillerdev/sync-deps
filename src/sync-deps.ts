import {initPackageManagerInterface, resolveFilenameToCwd} from './package-manager-interface'

const packageManager = initPackageManagerInterface();
if (typeof packageManager === "undefined") {
  console.warn(
    "[sync-deps] no supported lockfile found. Can't sync dependencies."
  );
  process.exit(0);
}

// get desired dependencies
const pkg = require(resolveFilenameToCwd("./package.json"));
const dependencies: Record<string, string> = {
  ...(pkg.dependencies || {}),
  ...(pkg.devDependencies || {}),
};

// compare locked vs installed dependencies
for (const [name, version] of Object.entries(dependencies)) {
  try {
    const installed = require(`${name}/package.json`);
    const lockedVersion = packageManager.getLockedVersion(name, version);

    if (!lockedVersion || installed.version !== lockedVersion) {
      packageManager.install();
      break;
    }
  } catch (e) {
    // tried to require a dependency from package.json that does not exist in node_modules
    // due to a bug in yarn, yarn will NOT install these missing dependencies!
    if (e.code === "MODULE_NOT_FOUND") packageManager.install();
    else if(e.code !== "ERR_PACKAGE_PATH_NOT_EXPORTED") throw e;
  }
}
