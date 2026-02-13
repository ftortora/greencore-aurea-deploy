

console.log('🔍 GREEN CORE AUREA - LOGIN DIAGNOSTICS');
console.log('==========================================');

// 1. Check localStorage
const token = localStorage.getItem('accessToken');
console.log('1️⃣ AccessToken in localStorage:', token ? '✅ PRESENTE' : '❌ ASSENTE');
if (token) {
  console.log('   Token preview:', token.substring(0, 30) + '...');
}

// 2. Check cookies
const cookies = document.cookie;
console.log('2️⃣ Cookies:', cookies ? '✅ PRESENTI' : '❌ ASSENTI');
if (cookies) {
  console.log('   Cookies:', cookies);
}

// 3. Test API connection
console.log('3️⃣ Testing API connection...');
fetch('http://localhost:10000/api/auth/me', {
  credentials: 'include',
  headers: {
    'Authorization': token ? `Bearer ${token}` : '',
  }
})
.then(res => {
  console.log('   API /auth/me status:', res.status);
  return res.json();
})
.then(data => {
  console.log('   API /auth/me response:', data);
  if (data.user || data.data?.user) {
    console.log('   ✅ USER DATA RECEIVED');
  } else {
    console.log('   ❌ NO USER DATA');
  }
})
.catch(err => {
  console.log('   ❌ API ERROR:', err.message);
});

// 4. Check React state
setTimeout(() => {
  console.log('4️⃣ React state check (wait 2 seconds)...');
  const root = document.getElementById('root');
  if (root) {
    console.log('   React root:', root.textContent.includes('Dashboard') ? '✅ DASHBOARD' : '❌ LOGIN SCREEN');
  }
}, 2000);

// 5. Instructions
console.log('\n📋 NEXT STEPS:');
console.log('   1. Try manual login with email/password');
console.log('   2. After login, run this script again');
console.log('   3. Check if token appears in localStorage');
console.log('   4. Share console output with developer');
console.log('\n💡 TIP: If token is present but still at login screen,');
console.log('   clear everything and try again:');
console.log('   localStorage.clear(); location.reload();');
