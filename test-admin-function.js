// Test script for the create-admin-user function
// Run this in the browser console to test the function

const testAdminCreation = async () => {
  const { supabase } = await import('./src/lib/supabaseClient.js');
  
  console.log('Testing admin creation function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: {
        email: 'test@example.com',
        password: 'testpassword123'
      }
    });
    
    if (error) {
      console.error('Function error:', error);
    } else {
      console.log('Function success:', data);
    }
  } catch (err) {
    console.error('Request error:', err);
  }
};

// Run the test
testAdminCreation();
