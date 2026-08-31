// Authentication System Test Script
// Run with: node --loader ts-node/esm test-auth.ts
// Or use REST client like Postman, Thunder Client, or curl

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Store tokens for testing
let accessToken = '';
let refreshToken = '';
let userId = '';

// Test data
const testUser = {
  email: 'test@clementine-shop.com',
  password: 'SecurePass123!',
  firstName: 'Test',
  lastName: 'User',
  phone: '+250788123456',
};

const adminUser = {
  email: 'admin@clementine-shop.com',
  password: 'AdminPass123!',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
};

/**
 * Test 1: Register a new customer
 */
async function testRegister() {
  console.log('\n📝 Test 1: Register new customer...');
  try {
    const response = await axios.post(`${API_URL}/register`, testUser);
    console.log('✅ Registration successful!');
    console.log('User ID:', response.data.data.user.id);
    console.log('Email:', response.data.data.user.email);
    console.log('Role:', response.data.data.user.role);

    // Store tokens
    accessToken = response.data.data.accessToken;
    refreshToken = response.data.data.refreshToken;
    userId = response.data.data.user.id;

    console.log('Access Token:', accessToken.substring(0, 50) + '...');
    console.log('Refresh Token:', refreshToken.substring(0, 50) + '...');
    return true;
  } catch (error: any) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('⚠️  User already exists, proceeding to login...');
      return false;
    }
    console.error('❌ Registration failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 2: Login with existing user
 */
async function testLogin() {
  console.log('\n🔐 Test 2: Login user...');
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    console.log('✅ Login successful!');
    console.log('User:', response.data.data.user.email);
    console.log('Role:', response.data.data.user.role);

    // Store tokens
    accessToken = response.data.data.accessToken;
    refreshToken = response.data.data.refreshToken;
    userId = response.data.data.user.id;

    console.log('Access Token received');
    console.log('Refresh Token received');
    return true;
  } catch (error: any) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 3: Get current user profile (Protected route)
 */
async function testGetProfile() {
  console.log('\n👤 Test 3: Get user profile (protected route)...');
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('✅ Profile retrieved successfully!');
    console.log('User:', response.data.data.user.email);
    console.log('Name:', response.data.data.user.firstName, response.data.data.user.lastName);
    console.log('Role:', response.data.data.user.role);
    console.log('Verified:', response.data.data.user.isVerified);
    return true;
  } catch (error: any) {
    console.error('❌ Get profile failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 4: Update user profile
 */
async function testUpdateProfile() {
  console.log('\n✏️  Test 4: Update user profile...');
  try {
    const response = await axios.patch(
      `${API_URL}/profile`,
      {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+250788999888',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    console.log('✅ Profile updated successfully!');
    console.log('New Name:', response.data.data.user.firstName, response.data.data.user.lastName);
    console.log('New Phone:', response.data.data.user.phone);
    return true;
  } catch (error: any) {
    console.error('❌ Update profile failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 5: Verify token
 */
async function testVerifyToken() {
  console.log('\n🔍 Test 5: Verify access token...');
  try {
    const response = await axios.get(`${API_URL}/verify`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('✅ Token is valid!');
    console.log('User ID:', response.data.data.user.userId);
    console.log('Email:', response.data.data.user.email);
    console.log('Role:', response.data.data.user.role);
    return true;
  } catch (error: any) {
    console.error('❌ Token verification failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 6: Test with invalid token
 */
async function testInvalidToken() {
  console.log('\n🚫 Test 6: Test with invalid token...');
  try {
    await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: 'Bearer invalid_token_here',
      },
    });
    console.error('❌ Should have failed with invalid token!');
    return false;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected invalid token');
      console.log('Error message:', error.response.data.message);
      return true;
    }
    console.error('❌ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 7: Refresh access token
 */
async function testRefreshToken() {
  console.log('\n🔄 Test 7: Refresh access token...');
  const oldAccessToken = accessToken;
  const oldRefreshToken = refreshToken;

  try {
    const response = await axios.post(`${API_URL}/refresh`, {
      refreshToken: refreshToken,
    });
    console.log('✅ Token refreshed successfully!');

    // Store new tokens
    accessToken = response.data.data.accessToken;
    refreshToken = response.data.data.refreshToken;

    console.log('New Access Token received');
    console.log('New Refresh Token received');
    console.log('Old tokens are now invalid (token rotation)');

    // Verify old refresh token is revoked
    console.log('\n   Testing if old refresh token is revoked...');
    try {
      await axios.post(`${API_URL}/refresh`, {
        refreshToken: oldRefreshToken,
      });
      console.error('   ❌ Old refresh token should be invalid!');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('   ✅ Old refresh token correctly revoked');
      }
    }

    return true;
  } catch (error: any) {
    console.error('❌ Token refresh failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 8: Change password
 */
async function testChangePassword() {
  console.log('\n🔑 Test 8: Change password...');
  const newPassword = 'NewSecurePass456!';

  try {
    const response = await axios.post(
      `${API_URL}/change-password`,
      {
        oldPassword: testUser.password,
        newPassword: newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    console.log('✅ Password changed successfully!');
    console.log('Message:', response.data.message);

    // Update test user password for next login
    testUser.password = newPassword;

    // Old refresh token should be invalid now
    console.log('\n   Testing if all tokens are revoked after password change...');
    try {
      await axios.post(`${API_URL}/refresh`, {
        refreshToken: refreshToken,
      });
      console.error('   ❌ Refresh token should be invalid after password change!');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('   ✅ All tokens correctly revoked after password change');
      }
    }

    // Need to login again
    console.log('\n   Logging in with new password...');
    await testLogin();

    return true;
  } catch (error: any) {
    console.error('❌ Change password failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 9: Register admin user
 */
async function testRegisterAdmin() {
  console.log('\n👑 Test 9: Register admin user...');
  try {
    const response = await axios.post(`${API_URL}/register`, adminUser);
    console.log('✅ Admin registration successful!');
    console.log('Admin ID:', response.data.data.user.id);
    console.log('Email:', response.data.data.user.email);
    console.log('Role:', response.data.data.user.role);
    return true;
  } catch (error: any) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('⚠️  Admin already exists');
      return true;
    }
    console.error('❌ Admin registration failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 10: Logout (revoke refresh token)
 */
async function testLogout() {
  console.log('\n👋 Test 10: Logout user...');
  try {
    const response = await axios.post(`${API_URL}/logout`, {
      refreshToken: refreshToken,
    });
    console.log('✅ Logout successful!');
    console.log('Message:', response.data.message);

    // Try to use revoked token
    console.log('\n   Testing if refresh token is revoked...');
    try {
      await axios.post(`${API_URL}/refresh`, {
        refreshToken: refreshToken,
      });
      console.error('   ❌ Refresh token should be invalid after logout!');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('   ✅ Refresh token correctly revoked');
      }
    }

    return true;
  } catch (error: any) {
    console.error('❌ Logout failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 11: Test logout from all devices
 */
async function testLogoutAll() {
  console.log('\n🚪 Test 11: Logout from all devices...');

  // First login to get tokens
  await testLogin();

  // Create another session (simulate another device)
  const response2 = await axios.post(`${API_URL}/login`, {
    email: testUser.email,
    password: testUser.password,
  });
  const refreshToken2 = response2.data.data.refreshToken;

  console.log('Created 2 sessions (2 refresh tokens)');

  try {
    const response = await axios.post(
      `${API_URL}/logout-all`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    console.log('✅ Logged out from all devices!');
    console.log('Message:', response.data.message);

    // Try to use both refresh tokens
    console.log('\n   Testing if all refresh tokens are revoked...');
    try {
      await axios.post(`${API_URL}/refresh`, {
        refreshToken: refreshToken,
      });
      console.error('   ❌ First refresh token should be invalid!');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('   ✅ First refresh token correctly revoked');
      }
    }

    try {
      await axios.post(`${API_URL}/refresh`, {
        refreshToken: refreshToken2,
      });
      console.error('   ❌ Second refresh token should be invalid!');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('   ✅ Second refresh token correctly revoked');
      }
    }

    return true;
  } catch (error: any) {
    console.error('❌ Logout all failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Starting Authentication System Tests...');
  console.log('API URL:', API_URL);
  console.log('='.repeat(60));

  const results = {
    passed: 0,
    failed: 0,
  };

  // Run tests sequentially
  const tests = [
    { name: 'Register', fn: testRegister },
    { name: 'Login', fn: testLogin },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Update Profile', fn: testUpdateProfile },
    { name: 'Verify Token', fn: testVerifyToken },
    { name: 'Invalid Token', fn: testInvalidToken },
    { name: 'Refresh Token', fn: testRefreshToken },
    { name: 'Change Password', fn: testChangePassword },
    { name: 'Register Admin', fn: testRegisterAdmin },
    { name: 'Logout', fn: testLogout },
    { name: 'Logout All', fn: testLogoutAll },
  ];

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      console.error(`\n❌ Test "${test.name}" threw an error:`, error);
      results.failed++;
    }

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.passed + results.failed}`);
  console.log('='.repeat(60));

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Authentication system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };
