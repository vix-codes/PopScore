const fs = require("fs");
const path = require("path");
const { users, movies, reviews } = require("./seedData");

const dataFile = path.join(__dirname, "store.json");

function ensureStore() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ users, movies, reviews }, null, 2));
  }
}

function readStore() {
  ensureStore();
  const raw = fs.readFileSync(dataFile, "utf-8");
  return JSON.parse(raw);
}

function writeStore(nextState) {
  fs.writeFileSync(dataFile, JSON.stringify(nextState, null, 2));
}

function updateStore(updater) {
  const current = readStore();
  const next = updater(current);
  writeStore(next);
  return next;
}

module.exports = { readStore, writeStore, updateStore };
