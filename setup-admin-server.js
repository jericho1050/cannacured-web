// Admin Server Setup Script
// Run this after logging in as the admin user

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function createAdminServer(authToken) {
  try {
    // Create the main server
    const serverResponse = await fetch(`${SERVER_URL}/api/servers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'CBD Hemp Community'
      })
    });

    if (!serverResponse.ok) {
      throw new Error(`Failed to create server: ${serverResponse.statusText}`);
    }

    const server = await serverResponse.json();
    console.log('✅ Server created:', server);

    // Update server settings
    const updateResponse = await fetch(`${SERVER_URL}/api/servers/${server.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        hexColor: 'rgba(106, 160, 55, 1)',
        verified: true
      })
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update server: ${updateResponse.statusText}`);
    }

    console.log('✅ Server updated successfully');

    // Create additional channels
    const channels = [
      { name: 'announcements', type: 0 },
      { name: 'product-discussion', type: 0 },
      { name: 'support', type: 0 }
    ];

    for (const channelData of channels) {
      const channelResponse = await fetch(`${SERVER_URL}/api/servers/${server.id}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(channelData)
      });

      if (channelResponse.ok) {
        const channel = await channelResponse.json();
        console.log(`✅ Channel created: ${channel.name}`);
      }
    }

    // Create admin role
    const adminRoleResponse = await fetch(`${SERVER_URL}/api/servers/${server.id}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (adminRoleResponse.ok) {
      const adminRole = await adminRoleResponse.json();
      
      // Update the admin role
      await fetch(`${SERVER_URL}/api/servers/${server.id}/roles/${adminRole.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: 'Administrator',
          hexColor: 'rgba(220, 20, 60, 1)',
          permissions: 2147483647 // All permissions
        })
      });

      console.log('✅ Admin role created and configured');
    }

    // Create custom invite
    const inviteResponse = await fetch(`${SERVER_URL}/api/servers/${server.id}/invites/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        code: 'community'
      })
    });

    if (inviteResponse.ok) {
      console.log('✅ Custom invite "community" created');
    }

    console.log('\n🎉 CBD Hemp Community server setup completed!');
    console.log(`Server ID: ${server.id}`);
    console.log('Invite link: /invite/community');

  } catch (error) {
    console.error('❌ Error setting up server:', error.message);
  }
}

// Usage instructions
console.log('Admin Server Setup Script');
console.log('========================');
console.log('');
console.log('1. Log in to the application as admin@cbdhemp.community');
console.log('2. Open browser developer tools (F12)');
console.log('3. Go to Application/Storage > Local Storage');
console.log('4. Find the "token" key and copy its value');
console.log('5. Run: node setup-admin-server.js YOUR_TOKEN_HERE');
console.log('');

const authToken = process.argv[2];

if (!authToken) {
  console.log('❌ Please provide your auth token as an argument');
  console.log('Usage: node setup-admin-server.js YOUR_TOKEN_HERE');
  process.exit(1);
}

createAdminServer(authToken); 