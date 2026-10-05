import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://neondb_owner:npg_6Rd4OYrocxsB@ep-tiny-sea-b58kfric-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function main() {
  await client.connect();
  
  // Demote any other admin to STUDENT so there is only one admin
  await client.query("UPDATE user_profiles SET role_key = 'STUDENT' WHERE role_key = 'COLLEGE_ADMIN' AND lower(email) != 'kajajhajaj369@gmail.com'");
  
  // Promote kajajhajaj369@gmail.com to COLLEGE_ADMIN
  const res = await client.query("UPDATE user_profiles SET role_key = 'COLLEGE_ADMIN' WHERE lower(email) = 'kajajhajaj369@gmail.com' RETURNING id, name, email, role_key");
  
  console.log('Successfully set admin:', res.rows);
  
  const allUsers = await client.query("SELECT id, name, email, role_key FROM user_profiles ORDER BY role_key, name");
  console.log('All users in DB:');
  console.table(allUsers.rows);
  
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
