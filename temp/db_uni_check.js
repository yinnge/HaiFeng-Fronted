const { Client } = require('pg');
const c = new Client({ host:'localhost', port:5432, database:'haifeng', user:'postgres', password:'haifengweilaiguihuayuan' });
(async () => {
  await c.connect();
  const t = await c.query("SELECT to_regclass('t_universities') AS t");
  console.log('t_universities 存在?', t.rows[0].t);
  if (t.rows[0].t) {
    const uni = await c.query('SELECT id, name, status FROM t_universities ORDER BY id LIMIT 8');
    uni.rows.forEach(r => console.log(' ', JSON.stringify(r), ' 超安全整数?', BigInt(r.id) > 9007199254740991n));
    const len = await c.query('SELECT id::text AS id FROM t_universities LIMIT 8');
    len.rows.forEach(r => console.log('  id 长度 =', r.id.length));
  }
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
