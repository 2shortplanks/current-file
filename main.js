const fs = require("fs");
const path = require("path");
const os = require("os");
const obsidian = require("obsidian");

module.exports = class CurrentFilePlugin extends obsidian.Plugin {
  onload() {
    if (!this.app.isMobile) {
      // navigation
      this.registerEvent(
        this.app.workspace.on(
          "active-leaf-change",
          this.writeCurrentFilename.bind(this)
        )
      );

      // opening a new file
      this.registerEvent(
        this.app.workspace.on("file-open", this.writeCurrentFilename.bind(this))
      );

      // renaming a file (needed in case someone renames the current file they're editing!)
      this.registerEvent(
        this.app.vault.on("rename", this.writeCurrentFilename.bind(this))
      );
    }
  }

  writeCurrentFilename() {
    // get the vault path
    let adapter = app.vault.adapter;
    if (!adapter instanceof obsidian.FileSystemAdapter) {
      // this isn't a filesystem adapter, so we can't get the path of the
      // file we're viewing.  Do not update the file
      return;
    }
    const vaultPath = adapter.getBasePath();

    // get the current active file path
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      // we're not looking at an active file, don't update the path of the
      // file we're viewing
      return;
    }
    const filePath = activeFile.path;

    // create the output
    const encodedJSON = JSON.stringify({
      file: filePath,
      vault: vaultPath,
      fullpath: path.join(vaultPath, filePath),
    });

    // write the file out
    // by using resolve instead of join, we can handle the case where the
    // filename is a filename is an absolute path
    const destFilename = path.resolve(
      os.homedir(),
      ".obsidian-current-file.json"
    );
    fs.writeFile(destFilename, encodedJSON, (err) => {
      if (err) {
        console.error("Error writing filename to file", err);
      }
    });
  }
};
