import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function verifyDatabase() {
  console.log('🔍 Verifying Neon PostgreSQL Database...\n');

  try {
    // Check connection
    console.log('✓ Testing database connection...');
    const result = await sql`SELECT NOW()`;
    console.log(`  Connected at: ${result[0].now}\n`);

    // List all tables
    console.log('✓ Checking tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`  Found ${tables.length} tables:`);
    tables.forEach((table: any) => {
      console.log(`    - ${table.table_name}`);
    });
    console.log('');

    // Check each expected table
    const expectedTables = [
      'messages',
      'chats',
      'documents',
      'document_images',
      'document_access',
      'document_chunks',
      'mcqs',
      'mindmaps',
      'study_sessions',
    ];

    console.log('✓ Verifying expected tables...');
    const tableNames = tables.map((t: any) => t.table_name);
    
    expectedTables.forEach((tableName) => {
      if (tableNames.includes(tableName)) {
        console.log(`  ✓ ${tableName}`);
      } else {
        console.log(`  ✗ ${tableName} (MISSING)`);
      }
    });
    console.log('');

    // Count rows in each table
    console.log('✓ Checking table contents...');
    for (const tableName of expectedTables) {
      if (tableNames.includes(tableName)) {
        try {
          const countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`;
          const count = await (sql as any)(countQuery);
          console.log(`  ${tableName}: ${count[0].count} rows`);
        } catch (err) {
          console.log(`  ${tableName}: Error counting rows`);
        }
      }
    }
    console.log('');

    console.log('🎉 Database verification complete!');
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  }
}

verifyDatabase();

