#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENCODE_DIR = path.join(os.homedir(), '.config', 'opencode');
const COMMANDS_DIR = path.join(OPENCODE_DIR, 'commands');
const commandFiles = ['ultracode.md', 'ultrarefactor.md'];

function installCommands() {
  try {
    if (!fs.existsSync(COMMANDS_DIR)) {
      fs.mkdirSync(COMMANDS_DIR, { recursive: true });
    }

    const srcDir = path.join(__dirname, 'src');
    const pillarsPath = path.join(srcDir, 'foundational_pillars.md');
    
    if (!fs.existsSync(pillarsPath)) {
      throw new Error("foundational_pillars.md is missing from the src directory.");
    }
    
    const pillarsContent = fs.readFileSync(pillarsPath, 'utf8');
    let injectedCount = 0;

    for (const file of commandFiles) {
      const sourcePath = path.join(srcDir, file);
      const destPath = path.join(COMMANDS_DIR, file);

      if (fs.existsSync(sourcePath)) {
        const baseCommand = fs.readFileSync(sourcePath, 'utf8');
        const compiledCommand = `${baseCommand.trimEnd()}\n${pillarsContent.trimStart()}`;
        fs.writeFileSync(destPath, compiledCommand, 'utf8');
        injectedCount++;
        console.log(`✅ Installed: /${file.replace('.md', '')}`);
      }
    }

    console.log(`\n🎉 Success! Injected ${injectedCount} commands into ${COMMANDS_DIR}`);
    console.log(`Open OpenCode and type /ultracode or /ultrarefactor to begin.`);

  } catch (error) {
    console.error(`❌ Installation failed: ${error.message}`);
    process.exit(1);
  }
}

function uninstallCommands() {
  try {
    let removedCount = 0;

    for (const file of commandFiles) {
      const destPath = path.join(COMMANDS_DIR, file);
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
        removedCount++;
        console.log(`🗑️ Removed: /${file.replace('.md', '')}`);
      }
    }

    if (removedCount > 0) {
      console.log(`\n✅ Success! Removed ${removedCount} commands from ${COMMANDS_DIR}`);
    } else {
      console.log(`\n⚠️ No commands found to remove in ${COMMANDS_DIR}. They might already be deleted.`);
    }

  } catch (error) {
    console.error(`❌ Uninstallation failed: ${error.message}`);
    process.exit(1);
  }
}

// CLI Argument Routing
const args = process.argv.slice(2);
const command = args[0];

if (command === 'install') {
  console.log("🚀 Installing OMO Ultra Commands...");
  installCommands();
} else if (command === 'uninstall') {
  console.log("🧹 Uninstalling OMO Ultra Commands...");
  uninstallCommands();
} else {
  console.log("Usage: bunx omo-ultracommands <install|uninstall>");
}