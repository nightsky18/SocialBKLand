const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const RECEIPT_PATH = path.join(__dirname, '../cache/receipts.json');

router.post('/', (req, res) => {
    let receipts = [];
    if (fs.existsSync(RECEIPT_PATH)) {
        receipts = JSON.parse(fs.readFileSync(RECEIPT_PATH, 'utf-8'));
    }
    receipts.push(req.body);
    fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipts, null, 2));
    res.status(201).json({ message: 'Comprobante guardado', id: req.body.receiptId });
});

module.exports = router;