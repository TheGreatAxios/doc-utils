#! /usr/bin/env node

/**
    Copyright (C) 2023 Dirt Road Development

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

    @file reload.ts
    @author Sawyer Cutler
*/

import chalk from "chalk";
import path from "path";
import { Flags, sortFlags } from "./utils/flags";
import { spawnProcess } from "./utils/process";
import { startServer } from "./utils/server";
import proc from "child_process";
import chokidar from "chokidar";

/**
 * @description Called via npx reload-ui
 */

async function main() {
  const flags: Flags = sortFlags(process.argv);

  const directory = path.dirname(flags.path);
  const nestedDirectory = path.dirname("../" + flags.path);

  /// Load Docs UI Wrapper
  spawnProcess({
    command: "git",
    args: ["submodule", "deinit", "-f", "--", flags.uiPath],
    directory,
  });

  spawnProcess({
    command: "git",
    args: ["rm", "-f", flags.uiPath],
    directory,
  });

  spawnProcess({
    command: "git",
    args: ["submodule", "add", flags.uiRepo],
    directory,
  });

  if (flags.uiOnly) {
    /// Build UI
    spawnProcess({
      command: flags.nodeRunner,
      args: ["--cwd", flags.uiPath, "install"],
      directory,
    });

    /// Build UI
    spawnProcess({
      command: flags.nodeRunner,
      args: ["--cwd", flags.uiPath, "bundle"],
      directory,
    });
  } else {
    spawnProcess({
      command: flags.nodeRunner,
      args: ["--cwd", flags.uiPath, "build:ui"],
      directory,
    });
  }

  startServer({
    port: flags.serverPort,
    open: flags.serverOpen,
    buildDir: flags.serverDir,
    wait: flags.serverWait,
  });

  // console.log("HELLO WROLD");

  proc.spawnSync(
    "npx",
    ["antora", "--fetch", "local-playbook-ui.yml", "--stacktrace"],
    {
      stdio: "inherit",
      cwd: directory
    }
  );

  // spawnProcess({
  //   command: "npm",
  //   args: flags.docsTrace
  //     ? ["exec", "--", "antora", "--fetch", flags.docsPlaybook, "--stacktrace"]
  //     : ["exec", "--", "antora", "--fetch", flags.docsPlaybook],
  //   stdio: "inherit",
  //   directory
  // });

  // chokidar.watch(["docs/**/*.yml", "docs/**/*.adoc"]).on("change", () => {
    // console.log("CHANGE DETECTED");
    // proc.spawnSync("ls", { cwd: path.dirname(flags.path) });
    // proc.spawnSync(
    //   "npx",
    //   ["antora", "--fetch", "local-playbook-ui.yml", "--stacktrace"],
    //   {
    //     stdio: "inherit",
    //     cwd: nestedDirectory
    //   }
    // );
    // spawnProcess({
    //   command: "npm",
    //   args: flags.docsTrace
    //     ? ["exec", "--", "antora", "--fetch", flags.docsPlaybook, "--stacktrace"]
    //     : ["exec", "--", "antora", "--fetch", flags.docsPlaybook],
    //   stdio: "inherit",
    //   directory
    // });

    // prepareDocs(path);
    // buildUI(path);
    // preview(path);
  // });
  // watch({
  //   paths: flags.watchPaths,
  //   event: flags.watchEvent,
  //   functions: [
  //     () =>
  //       spawnProcess({
  //         command: "npm",
  //         args: flags.docsTrace
  //           ? ["exec", "--", "antora", "--fetch", flags.docsPlaybook, "--stacktrace"]
  //           : ["exec", "--", "antora", "--fetch", flags.docsPlaybook],
  //         directory,
  //         stdio: "inherit"
  //       }),
  //   ],
  //   logPath: flags.watchLogPath,
  //   logStats: flags.watchLogStats,
  // });
}

main().catch((error) => {
  console.error(chalk.redBright(error));
  process.exitCode = 1;
});
