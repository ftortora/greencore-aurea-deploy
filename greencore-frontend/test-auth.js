

console.log('🧪 GREEN CORE AUREA - LOGIN/REGISTER TEST');
console.log('==========================================');

// === TEST 1: REGISTER ===
async function testRegister() {
  console.log('\n📝 TEST 1: REGISTER');
  console.log('-------------------');
  
  const testUser = {
    username: 'testuser123',
    email: 'test@example.com',
    password: 'TestPass123!'
  };
  
  console.log('Sending:', testUser);
  
  try {
    const response = await fetch('http://localhost:10000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ REGISTER SUCCESS');
      console.log('Token presente:', !!(data.accessToken || data.data?.accessToken));
      console.log('User presente:', !!(data.user || data.data?.user));
      return data;
    } else {
      console.log('❌ REGISTER FAILED');
      console.log('Error:', data.message || data.error);
      return null;
    }
  } catch (err) {
    console.log('❌ REGISTER ERROR:', err.message);
    return null;
  }
}

// === TEST 2: LOGIN ===
async function testLogin() {
  console.log('\n🔐 TEST 2: LOGIN');
  console.log('----------------');
  
  const credentials = {
    email: 'test@example.com',
    password: 'TestPass123!'
  };
  
  console.log('Sending:', { email: credentials.email, password: '***' });
  
  try {
    const response = await fetch('http://localhost:10000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ LOGIN SUCCESS');
      console.log('Token presente:', !!(data.accessToken || data.data?.accessToken));
      console.log('User presente:', !!(data.user || data.data?.user));
      
      // Salva token per test successivi
      const token = data.accessToken || data.data?.accessToken;
      if (token) {
        localStorage.setItem('accessToken', token);
        console.log('Token saved to localStorage');
      }
      
      return data;
    } else {
      console.log('❌ LOGIN FAILED');
      console.log('Error:', data.message || data.error);
      return null;
    }
  } catch (err) {
    console.log('❌ LOGIN ERROR:', err.message);
    return null;
  }
}

// === TEST 3: VERIFY TOKEN ===
async function testVerifyToken() {
  console.log('\n🔍 TEST 3: VERIFY TOKEN');
  console.log('----------------------');
  
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    console.log('❌ No token in localStorage');
    return;
  }
  
  console.log('Token presente:', !!token);
  
  try {
    const response = await fetch('http://localhost:10000/api/auth/me', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ TOKEN VALID');
      console.log('User:', data.user || data.data?.user);
    } else {
      console.log('❌ TOKEN INVALID');
      console.log('Error:', data.message || data.error);
    }
  } catch (err) {
    console.log('❌ VERIFY ERROR:', err.message);
  }
}

// === RUN ALL TESTS ===
async function runAllTests() {
  console.log('🚀 Running all tests...\n');
  
  // Test 1: Register
  const registerResult = await testRegister();
  
  // Aspetta 1 secondo
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 2: Login
  const loginResult = await testLogin();
  
  // Aspetta 1 secondo
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 3: Verify token
  await testVerifyToken();
  
  console.log('\n✅ All tests completed!');
  console.log('Check results above ☝️');
}

// === USAGE ===
console.log('\n📋 COMANDI DISPONIBILI:');
console.log('  testRegister()  - Test registrazione');
console.log('  testLogin()     - Test login');
console.log('  testVerifyToken() - Test validazione token');
console.log('  runAllTests()   - Esegui tutti i test');
console.log('\n💡 Esempio: runAllTests()');
