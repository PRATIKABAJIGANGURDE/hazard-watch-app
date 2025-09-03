#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

console.log('🌊 INCOIS Hazard Reporting Backend Setup');
console.log('==========================================\n');

async function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
    console.log('✅ Completed\n');
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    throw error;
  }
}

async function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} exists`);
    return true;
  } else {
    console.log(`❌ ${description} missing`);
    return false;
  }
}

async function setup() {
  try {
    console.log('🔍 Checking prerequisites...');
    
    // Check if .env file exists
    const hasEnv = checkFile('.env', 'Environment configuration (.env)');
    if (!hasEnv) {
      console.log('📝 Please copy .env.example to .env and configure your Neon database URL');
      console.log('   cp .env.example .env');
      console.log('   Then edit .env with your Neon connection string\n');
      return;
    }

    // Install dependencies
    await runCommand('npm install', 'Installing dependencies');

    // Build the project
    await runCommand('npm run build', 'Building TypeScript project');

    // Check if we can connect to database (this will also run migrations)
    console.log('🗄️ Testing database connection and running migrations...');
    await runCommand('npm run migrate', 'Running database migrations');

    // Optionally seed sample data
    console.log('🌱 Would you like to seed the database with sample data? (y/n)');
    // For automated setup, we'll skip interactive prompt
    console.log('   To seed manually later: npm run seed\n');

    console.log('🎉 Setup completed successfully!');
    console.log('\n📚 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Test the API: curl http://localhost:3001/api/health');
    console.log('3. Check the API documentation in README.md');
    console.log('4. Review API examples in API_EXAMPLES.md');
    console.log('\n🔗 API will be available at: http://localhost:3001');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure your .env file has the correct DATABASE_URL');
    console.log('2. Verify your Neon database is accessible');
    console.log('3. Check that PostGIS extension is enabled');
    console.log('4. Review NEON_SETUP.md for detailed instructions');
    process.exit(1);
  }
}

setup();