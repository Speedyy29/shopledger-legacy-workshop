const test = require('node:test');
const assert = require('node:assert/strict');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function compare(order, expected) {
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkoutFigures = pricing.computeTotals(order.items, order.coupon);

  assert.deepEqual(
    {
      subtotal: invoiceFigures.subtotal,
      discount: invoiceFigures.discount,
      tax: invoiceFigures.tax,
      cgst: invoiceFigures.cgst,
      sgst: invoiceFigures.sgst,
      total: invoiceFigures.total,
      rows: invoiceFigures.rows.map(({ gstPercent, lineTax }) => ({ gstPercent, lineTax }))
    },
    expected.invoice
  );
  assert.deepEqual(
    {
      subtotal: checkoutFigures.subtotal,
      discount: checkoutFigures.discount,
      tax: checkoutFigures.tax,
      cgst: checkoutFigures.cgst,
      sgst: checkoutFigures.sgst,
      total: checkoutFigures.total
    },
    expected.checkout
  );
}

test('CURRENT BEHAVIOUR: order #1001 style mixed 5% and 12% no-coupon invoice', () => {
  compare({
    items: [
      { id: 1, name: 'Rice', sku: 'GRN-001', price: 160, qty: 1, hsn: '1006', gstRate: 5 },
      { id: 6, name: 'Ghee', sku: 'DRY-001', price: 450, qty: 1, hsn: '0405', gstRate: 12 }
    ],
    coupon: ''
  }, {
    invoice: {
      subtotal: 610, discount: 0, tax: 62, cgst: 31, sgst: 31, total: 672,
      rows: [{ gstPercent: 5, lineTax: 8 }, { gstPercent: 12, lineTax: 54 }]
    },
    checkout: { subtotal: 610, discount: 0, tax: 62, cgst: 31, sgst: 31, total: 672 }
  });
});

test('order #1002 style SAVE10 invoice matches checkout discount and GST', () => {
  compare({
    items: [
      { id: 1, name: 'Rice', sku: 'GRN-001', price: 640, qty: 1, hsn: '1006', gstRate: 5 },
      { id: 4, name: 'Sunflower Oil', sku: 'OIL-001', price: 190, qty: 2, hsn: '1512', gstRate: 5 }
    ],
    coupon: 'SAVE10'
  }, {
    invoice: {
      subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9,
      rows: [{ gstPercent: 5, lineTax: 28.8 }, { gstPercent: 5, lineTax: 17.1 }]
    },
    checkout: { subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9 }
  });
});

test('order #1004 style SAVE10 invoice applies the ₹150 discount cap before tax', () => {
  compare({
    items: [
      { id: 5, name: 'Groundnut Oil', sku: 'OIL-002', price: 1120, qty: 2, hsn: '1508', gstRate: 5 }
    ],
    coupon: 'SAVE10'
  }, {
    invoice: {
      subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5,
      rows: [{ gstPercent: 5, lineTax: 104.5 }]
    },
    checkout: { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5 }
  });
});

test('CURRENT BEHAVIOUR: order #1008 style 18% items without a coupon match checkout', () => {
  compare({
    items: [
      { id: 8, name: 'Tea', sku: 'BEV-001', price: 140, qty: 1, hsn: '0902', gstRate: 18 },
      { id: 12, name: 'Kokum Sherbet', sku: 'BEV-003', price: 180, qty: 2, hsn: '2106', gstRate: 18 }
    ],
    coupon: ''
  }, {
    invoice: {
      subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590,
      rows: [{ gstPercent: 18, lineTax: 25.2 }, { gstPercent: 18, lineTax: 64.8 }]
    },
    checkout: { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590 }
  });
});

test('invoice figures match checkout HSN GST and capped discount before tax', () => {
  const order = {
    coupon: 'SAVE10',
    items: [
      { id: 5, name: 'Groundnut Oil', sku: 'OIL-002', price: 1120, qty: 2, hsn: '1508' }
    ]
  };
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkoutFigures = pricing.computeTotals(order.items, order.coupon);

  assert.deepEqual(
    {
      subtotal: invoiceFigures.subtotal,
      discount: invoiceFigures.discount,
      tax: invoiceFigures.tax,
      cgst: invoiceFigures.cgst,
      sgst: invoiceFigures.sgst,
      total: invoiceFigures.total,
      rows: invoiceFigures.rows.map(({ gstPercent, lineTax }) => ({ gstPercent, tax: lineTax }))
    },
    {
      subtotal: checkoutFigures.subtotal,
      discount: checkoutFigures.discount,
      tax: checkoutFigures.tax,
      cgst: checkoutFigures.cgst,
      sgst: checkoutFigures.sgst,
      total: checkoutFigures.total,
      rows: checkoutFigures.lines.map(({ gstPercent, tax }) => ({ gstPercent, tax }))
    }
  );
});
