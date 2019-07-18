const { Client } = require('pg');

const client = new Client({
  connectionString: "postgres://ruxjzxdrynnpkh:35b4833205666702e5813ce4627dfcd2bc2bf21b61e533ffeed72f18214acfd4@ec2-54-163-226-238.compute-1.amazonaws.com:5432/da0kd3bdjfcoa0",
  ssl: true,
});

client.connect();

client.query('SELECT * FROM flights', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});