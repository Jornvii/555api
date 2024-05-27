const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mydatabase'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');

    // Select some data from the database and log it to the console
    const query = 'SELECT * FROM products LIMIT 5;';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }
        console.log('Selected data from the database:');
        results.forEach(row => {
            console.log(row);
        });
    });
});

// Route to handle fetching Process options based on PartNo
app.post('/get-process-options', (req, res) => {
    const { PartNo } = req.body;
    const query = 'SELECT DISTINCT process FROM products WHERE part_no = ?';
    db.query(query, [PartNo], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results.map(row => row.process));
    });
});

// Route to handle fetching MC options based on Process
app.post('/get-mc-options', (req, res) => {
    const { PartNo, Process } = req.body;
    const query = 'SELECT DISTINCT mc FROM products WHERE part_no = ? AND process = ?';
    db.query(query, [PartNo, Process], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results.map(row => row.mc));
    });
});

// Route to handle fetching data
app.post('/get-products', (req, res) => {
    const { PartNo, Process, MC } = req.body;
    const query = 'SELECT * FROM products WHERE part_no = ? AND process = ? AND mc = ?';
    db.query(query, [PartNo, Process, MC], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});

// Route to handle updating data
app.post('/update-product', (req, res) => {
    const { id, Qty, Result1, Result2, Result3, Result4, Result5, Result6 } = req.body;
    const query = `
        UPDATE products 
        SET qty = ?, result1 = ?, result2 = ?, result3 = ?, result4 = ?, result5 = ?, result6 = ?
        WHERE id = ?
    `;
    db.query(query, [Qty, Result1, Result2, Result3, Result4, Result5, Result6, id], (err, results) => {
        if (err) {
            console.error('Error executing update query:', err);
            res.status(500).json({ error: 'Database update failed' });
            return;
        }
        res.json({ success: true });
    });
});


app.post('/submit-request', (req, res) => {
    const { selectedRows, Position, Department, PhoneNumber } = req.body;
    const query = `
      INSERT INTO req_Product (part_no, process, mc, item_no, master_tooling_id, spec, usage_pcs, qty, result1, result2, result3, result4, result5, result6, position, department, phone_number) 
      VALUES ?
    `;
  
    const values = selectedRows.map(row => [
      row.part_no, row.process, row.mc, row.item_no, row.master_tooling_id, row.spec, row.usage_pcs, row.qty,
      row.result1, row.result2, row.result3, row.result4, row.result5, row.result6,
      Position, Department, PhoneNumber
    ]);
  
    db.query(query, [values], (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ error: 'Database insert failed' });
        return;
      }
      res.json({ success: true });
    });
  });
  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
