const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const expoNodeModules = path.join(projectRoot, "node_modules", "expo", "node_modules");
const motiNodeModules = path.join(projectRoot, "node_modules", "moti", "node_modules");

function ensureDir(target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
}

function ensureExpoNestedSymlink(packageName) {
  const rootPackage = path.join(projectRoot, "node_modules", packageName);
  const nestedPackage = path.join(expoNodeModules, packageName);

  if (!fs.existsSync(rootPackage)) {
    console.warn(`[postinstall] root ${packageName} not found, skipping symlink fix.`);
    return;
  }

  ensureDir(expoNodeModules);

  try {
    if (fs.existsSync(nestedPackage)) {
      return;
    }

    const relativeTarget = path.relative(expoNodeModules, rootPackage);
    fs.symlinkSync(relativeTarget, nestedPackage, "junction");
    console.log(`[postinstall] linked expo/node_modules/${packageName} -> ${relativeTarget}`);
  } catch (error) {
    console.warn(`[postinstall] failed to link ${packageName}:`, error.message);
  }
}

function relinkNestedPeer(packageName) {
  const rootPackage = path.join(projectRoot, "node_modules", packageName);
  const nestedPackage = path.join(motiNodeModules, packageName);

  if (!fs.existsSync(rootPackage) || !fs.existsSync(motiNodeModules)) {
    return;
  }

  try {
    if (fs.existsSync(nestedPackage)) {
      fs.rmSync(nestedPackage, { recursive: true, force: true });
    }

    const relativeTarget = path.relative(motiNodeModules, rootPackage);
    fs.symlinkSync(relativeTarget, nestedPackage, "junction");
    console.log(`[postinstall] linked moti/node_modules/${packageName} -> ${relativeTarget}`);
  } catch (error) {
    console.warn(`[postinstall] failed to relink ${packageName}:`, error.message);
  }
}

ensureExpoNestedSymlink("expo-asset");
ensureExpoNestedSymlink("expo-constants");
relinkNestedPeer("react");
relinkNestedPeer("react-dom");
relinkNestedPeer("scheduler");
