const { Client } = require('pg');
const base = { host:'localhost', port:5432, user:'postgres', password:'haifengweilaiguihuayuan' };
(async () => {
  const c = new Client(base);
  await c.connect();
  const dbs = await c.query("SELECT datname FROM pg_database WHERE NOT datistemplate AND datallowconn ORDER BY datname");
  console.log('所有可连接库:', dbs.rows.map(r=>r.datname).join(', '));
  for (const { datname } of dbs.rows) {
    const db = new Client({ ...base, database: datname });
    try {
      await db.connect();
      const t = await db.query("SELECT to_regclass('t_major') AS exists");
      if (t.rows[0].exists) {
        const r = await db.query("SELECT major_category, status, COUNT(*) AS n FROM t_major GROUP BY major_category, status ORDER BY major_category");
        console.log(`\n[${datname}] t_major 存在:`);
        r.rows.forEach(x => console.log('   ', JSON.stringify(x)));
      }
      await db.end();
    } catch (e) {
      console.log(`[${datname}] 查询失败:`, e.message);
    }
  }
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
