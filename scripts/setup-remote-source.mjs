// Vercel install-time bootstrap: pulls the full source tree from the public
// GitHub repo (pinned commit) and applies fixes.patch on top. This keeps the
// deployment payload tiny — only the patch and helper scripts travel inline.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const COMMIT = "990bfc3b66531e8099fd934339a91f65097ceed0";
const TARBALL = `https://codeload.github.com/Smoothtr/phuongphuong/tar.gz/${COMMIT}`;

const run = (command) => execSync(command, { stdio: "inherit" });

if (existsSync("src/App.jsx")) {
  console.log("source already present — skipping fetch");
} else {
  run(`curl -sL ${TARBALL} -o source.tgz`);
  run("tar xzf source.tgz --strip-components=1");
  run("rm source.tgz");
  run("git apply --whitespace=nowarn fixes.patch");
  console.log("source fetched @", COMMIT.slice(0, 7), "+ fixes.patch applied");
}
