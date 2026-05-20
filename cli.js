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

// --- DEPENDENCY CHECK FUNCTION ---
function checkOhMyOpenAgent() {
  const configFiles = ['opencode.json', 'opencode.jsonc'];
  
  for (const file of configFiles) {
    const configPath = path.join(OPENCODE_DIR, file);
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      if (content.includes('"oh-my-openagent"') || content.includes('"oh-my-opencode"')) {
        return true;
      }
    }
  }
  return false;
}

// --- COMMAND: INSTALL ---
function installCommands() {
  try {
    if (!checkOhMyOpenAgent()) {
      console.log("⚠️  WARNING: 'oh-my-openagent' does not appear in your global OpenCode config.");
      console.log("   The commands will be installed, but they will NOT work until you install the plugin via:");
      console.log("   bun install oh-my-openagent@latest && add it to your opencode.json\n");
    }

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
        const compiledCommand = `${baseCommand.trimEnd()}\n\n${pillarsContent.trimStart()}`;
        fs.writeFileSync(destPath, compiledCommand, 'utf8');
        injectedCount++;
        console.log(`✅ Installed: /${file.replace('.md', '')}`);
      }
    }

    console.log(`\n🎉 Success! Injected ${injectedCount} commands into ${COMMANDS_DIR}`);
  } catch (error) {
    console.error(`❌ Installation failed: ${error.message}`);
    process.exit(1);
  }
}

// --- COMMAND: UNINSTALL ---
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
      console.log(`\n⚠️ No commands found to remove. They might already be deleted.`);
    }

  } catch (error) {
    console.error(`❌ Uninstallation failed: ${error.message}`);
    process.exit(1);
  }
}

// --- COMMAND: AGENTS (GENERATE AGENTS.MD LOCALLY) ---
function generateAgentsMD() {
  try {
    const targetPath = path.join(process.cwd(), 'AGENTS.md');
    const srcDir = path.join(__dirname, 'src');
    const pillarsPath = path.join(srcDir, 'foundational_pillars.md');

    if (!fs.existsSync(pillarsPath)) {
      throw new Error("foundational_pillars.md is missing from the src directory.");
    }

    const topPart = `# Code Generation & Architecture Directives

## Primary Mandate

All code generation, system design, and refactoring tasks must strictly adhere to the foundational software engineering principles outlined below.

---`;

    const pillarsContent = fs.readFileSync(pillarsPath, 'utf8');
    
    // Trim and stitch them together with exactly one blank line in between
    const finalContent = `${topPart.trimEnd()}\n\n${pillarsContent.trimStart()}`;

    fs.writeFileSync(targetPath, finalContent, 'utf8');
    console.log(`✅ Generated: AGENTS.md in your current directory!`);
    
  } catch (error) {
    console.error(`❌ Failed to generate AGENTS.md: ${error.message}`);
    process.exit(1);
  }
}

// --- CLI ARGUMENT ROUTING ---
const args = process.argv.slice(2);
const command = args[0];

if (command === 'install') {
  console.log("🚀 Installing OMO Ultra Commands...");
  installCommands();
} else if (command === 'uninstall') {
  console.log("🧹 Uninstalling OMO Ultra Commands...");
  uninstallCommands();
} else if (command === 'agents') {
  console.log("📄 Generating AGENTS.md...");
  generateAgentsMD();
} else {
  console.log("Usage: bunx github:your-username/omo-ultracommands <install|uninstall|agents>");
}