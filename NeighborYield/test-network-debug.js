/**
 * Network Debugging Script
 * Run this to test network connectivity from your development environment
 */

const https = require('https');
const dns = require('dns');

const SUPABASE_URL = 'jmhqkbgygoxlvxokdajv.supabase.co';

console.log('🔍 Network Debugging Tool\n');
console.log('=' .repeat(60));

// Test 1: DNS Resolution
console.log('\n📡 Test 1: DNS Resolution');
console.log('-'.repeat(60));
dns.resolve4(SUPABASE_URL, (err, addresses) => {
  if (err) {
    console.error('❌ DNS resolution failed:', err.message);
    console.error('   This means your system cannot resolve the Supabase domain');
  } else {
    console.log('✅ DNS resolution successful');
    console.log('   IP addresses:', addresses.join(', '));
  }
  
  // Test 2: HTTPS Connection
  console.log('\n🌐 Test 2: HTTPS Connection');
  console.log('-'.repeat(60));
  
  const options = {
    hostname: SUPABASE_URL,
    port: 443,
    path: '/',
    method: 'HEAD',
    timeout: 5000,
  };
  
  const req = https.request(options, (res) => {
    console.log('✅ HTTPS connection successful');
    console.log('   Status code:', res.statusCode);
    console.log('   Headers:', JSON.stringify(res.headers, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All network tests passed!');
    console.log('   Your development machine can reach Supabase.');
    console.log('   If the Android emulator still fails, the issue is with');
    console.log('   the emulator\'s network configuration, not your network.');
    console.log('='.repeat(60));
  });
  
  req.on('error', (error) => {
    console.error('❌ HTTPS connection failed:', error.message);
    console.error('   This means your system cannot connect to Supabase');
    console.error('   Possible causes:');
    console.error('   - Firewall blocking HTTPS traffic');
    console.error('   - No internet connection');
    console.error('   - Proxy configuration issues');
  });
  
  req.on('timeout', () => {
    console.error('❌ Connection timeout');
    console.error('   The connection took too long to establish');
    req.destroy();
  });
  
  req.end();
});

// Test 3: Check if running in emulator
console.log('\n📱 Test 3: Environment Check');
console.log('-'.repeat(60));
console.log('   Platform:', process.platform);
console.log('   Node version:', process.version);
console.log('   Running from:', __dirname);
