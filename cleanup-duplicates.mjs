import { db } from './src/db/client.js';
import { sql } from 'drizzle-orm';

async function cleanupDuplicateUsers() {
  console.log('Starting cleanup of duplicate users...');
  
  try {
    // Step 1: Count duplicates before cleanup
    const beforeCount = await db.execute(sql`
      SELECT COUNT(*) as total FROM users
    `);
    console.log('Total users before cleanup:', beforeCount.rows[0].total);
    
    // Step 2: Delete duplicates, keeping only the first occurrence of each email
    const deleteResult = await db.execute(sql`
      DELETE FROM users 
      WHERE id NOT IN (
          SELECT MIN(id) 
          FROM users 
          GROUP BY email
      )
    `);
    console.log('Deleted duplicate users:', deleteResult.rowCount || 0);
    
    // Step 3: Add unique constraint (if it doesn't exist)
    try {
      await db.execute(sql`
        ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email)
      `);
      console.log('Added unique constraint to email column');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Unique constraint already exists');
      } else {
        console.error('Error adding unique constraint:', error.message);
      }
    }
    
    // Step 4: Count after cleanup
    const afterCount = await db.execute(sql`
      SELECT COUNT(*) as total FROM users
    `);
    console.log('Total users after cleanup:', afterCount.rows[0].total);
    
    // Step 5: Verify no duplicates remain
    const duplicateCheck = await db.execute(sql`
      SELECT email, COUNT(*) as count 
      FROM users 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateCheck.rows.length === 0) {
      console.log('✅ No duplicate emails found - cleanup successful!');
    } else {
      console.log('❌ Still have duplicates:', duplicateCheck.rows);
    }
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
  
  process.exit(0);
}

cleanupDuplicateUsers();