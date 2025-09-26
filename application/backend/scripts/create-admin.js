const axios = require('axios');

async function createAdminUser() {
  try {
    const response = await axios.post('http://localhost:3001/auth/register', {
      name: 'Admin User',
      email: 'admin@ticketnow.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@ticketnow.com');
    console.log('Password: admin123');
    console.log('Token:', response.data.token);
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️  Admin user already exists');
      console.log('Email: admin@ticketnow.com');
      console.log('Password: admin123');
    } else {
      console.error('❌ Error creating admin user:', error.response?.data || error.message);
    }
  }
}

createAdminUser();
