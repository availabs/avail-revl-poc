// If we need to allow other modules to finish up
//   before we remove the tmpDir, we could have
//   a queue of async functions that we await before
//   removing the dir.
// See: https://github.com/tapppi/async-exit-hook

import { mkdirSync } from "fs";
import exitHook from "exit-hook";

import { sync as rimrafSync } from "rimraf";

import tmpDirPath from ".";

mkdirSync(tmpDirPath, { recursive: true });

exitHook(() => {
  try {
    rimrafSync(tmpDirPath);
  } catch (err) {
    console.error(err);
  }
});

export default tmpDirPath;
