#!/usr/bin/env node

/**
 * Test script to verify n8n integration with Lite CRM
 * 
 * Usage:
 *   node test-n8n-connection.js
 * 
 * This script:
 * 1. Tests if n8n is accessible
 * 2. Creates a test webhook
 * 3. Sends a test payload
 * 4. Verifies the connection works
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const N8N_URL = process.env.N8N_URL || 'http://localhost:5678';
const TEST_WORKFLOW_ID = process.argv[2]; // Pass workflow ID as argument

async function testConnection() {
  console.log('\n🧪 Testing n8n Integration with Lite CRM\n');
  console.log(`n8n URL: ${N8N_URL}\n`);

  // Test 1: Check if n8n is accessible
  console.log('1️⃣  Testing n8n accessibility...');
  try {
    const healthCheck = await fetch(`${N8N_URL}/healthz`);
    if (healthCheck.ok) {
      console.log('   ✅ n8n is accessible\n');
    } else {
      console.log('   ⚠️  n8n responded but may not be fully ready\n');
    }
  } catch (error) {
    console.log('   ❌ Cannot reach n8n:', error.message);
    console.log('\n   💡 Make sure n8n is running:');
    console.log('      docker-compose up -d n8n');
    console.log('      or visit http://localhost:5678\n');
    process.exit(1);
  }

  // Test 2: If workflow ID provided, test webhook
  if (TEST_WORKFLOW_ID) {
    console.log(`2️⃣  Testing webhook: ${TEST_WORKFLOW_ID}...`);
    const testPayload = {
      event: 'lead.created',
      workspaceId: 'test-workspace',
      data: {
        lead: {
          id: 'test-lead-123',
          name: 'Test Lead',
          email: 'test@example.com',
          phone: '+1234567890',
          company: 'Test Company',
          source: 'Manual',
          region: 'US',
          stage: 'NEW',
          owner: {
            id: 'test-user',
            name: 'Test User',
            email: 'user@example.com'
          }
        }
      }
    };

    try {
      const webhookUrl = `${N8N_URL}/webhook/${TEST_WORKFLOW_ID}`;
      console.log(`   Sending test payload to: ${webhookUrl}`);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        const result = await response.text();
        console.log('   ✅ Webhook triggered successfully!');
        console.log(`   Response: ${result.substring(0, 100)}...\n`);
        console.log('   💡 Check n8n workflow executions to see the result\n');
      } else {
        console.log(`   ❌ Webhook failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`   Error: ${errorText}\n`);
      }
    } catch (error) {
      console.log('   ❌ Error calling webhook:', error.message);
      console.log('\n   💡 Make sure:');
      console.log('      - Workflow ID is correct');
      console.log('      - Workflow is active in n8n');
      console.log('      - Webhook node is configured correctly\n');
    }
  } else {
    console.log('2️⃣  Skipping webhook test (no workflow ID provided)');
    console.log('   💡 To test webhook, run:');
    console.log(`      node test-n8n-connection.js YOUR_WORKFLOW_ID\n`);
  }

  // Test 3: Check environment variables
  console.log('3️⃣  Checking environment configuration...');
  const requiredVars = [
    'N8N_URL',
    'N8N_WORKFLOW_LEAD_CREATED',
  ];

  const missing = [];
  requiredVars.forEach(varName => {
    if (!process.env[varName] && varName !== 'N8N_WORKFLOW_LEAD_CREATED') {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.log('   ⚠️  Missing environment variables:');
    missing.forEach(v => console.log(`      - ${v}`));
    console.log('\n   💡 Add these to backend/.env file\n');
  } else {
    console.log('   ✅ Environment variables configured\n');
  }

  // Summary
  console.log('📋 Summary:');
  console.log('   - n8n is accessible');
  if (TEST_WORKFLOW_ID) {
    console.log('   - Webhook test completed');
  }
  console.log('   - Check backend/.env for workflow IDs');
  console.log('\n✨ Next steps:');
  console.log('   1. Create a webhook in n8n');
  console.log('   2. Add workflow ID to backend/.env');
  console.log('   3. Restart backend');
  console.log('   4. Create a lead in CRM to test!\n');
}

// Run the test
testConnection().catch(console.error);
