// Crop of Now — one-time setup for the expense tracker and receipts folders.
// Run setupCropOfNow() once from script.google.com (signed in as the account that should own the books).
// Creates:  My Drive/Crop of Now/{Receipts/<year>, Legal & Formation, Tax Documents}
//           My Drive/Crop of Now/Crop of Now – Books (Google Sheet: Expenses, Income, Summary, Categories)

const CATEGORIES = [
  ['Cost of goods sold', 'Part III / Line 4', 'Merch samples, inventory, craft peanuts'],
  ['Advertising', 'Line 8', 'Ads, promo, stickers given away'],
  ['Contract labor', 'Line 11', 'Designers, freelancers'],
  ['Legal & professional', 'Line 17', 'Accountant, attorney, registered office provider'],
  ['Office expense', 'Line 18', 'Small office supplies'],
  ['Software & subscriptions', 'Line 18 / 27a', 'Shopify, Printful Growth, apps'],
  ['Website & domain', 'Line 27a', 'Domain renewal, hosting'],
  ['Supplies', 'Line 22', 'Packaging, roasting supplies'],
  ['Taxes & licenses', 'Line 23', 'PA LLC filing, annual report, permits'],
  ['Shipping & postage', 'Line 27a', 'Postage, shipping labels'],
  ['Merchant & platform fees', 'Line 10', 'Shopify Payments, PayPal, Etsy fees'],
  ['Travel', 'Line 24a', 'Business travel'],
  ['Meals (50%)', 'Line 24b', 'Business meals, 50% deductible'],
  ['Bank fees', 'Line 27a', 'Business account fees'],
  ['Other', 'Line 27a', 'Anything else, note it'],
];

function setupCropOfNow() {
  const root = folder_(DriveApp.getRootFolder(), 'Crop of Now');
  const receipts = folder_(root, 'Receipts');
  folder_(receipts, String(new Date().getFullYear()));
  folder_(root, 'Legal & Formation');
  folder_(root, 'Tax Documents');

  const ss = SpreadsheetApp.create('Crop of Now – Books');
  DriveApp.getFileById(ss.getId()).moveTo(root);

  // Categories
  const cat = ss.getSheets()[0].setName('Categories');
  cat.getRange(1, 1, 1, 3).setValues([['Category', 'Schedule C line', 'Examples']]);
  cat.getRange(2, 1, CATEGORIES.length, 3).setValues(CATEGORIES);
  header_(cat, 3); cat.autoResizeColumns(1, 3);

  // Expenses
  const ex = ss.insertSheet('Expenses', 0);
  const exHead = ['Date', 'Vendor', 'Description', 'Category', 'Amount', 'Payment method', 'Paid from', 'Deductible?', 'Receipt link', 'Notes'];
  ex.getRange(1, 1, 1, exHead.length).setValues([exHead]);
  header_(ex, exHead.length);
  ex.getRange('A2:A').setNumberFormat('yyyy-mm-dd');
  ex.getRange('E2:E').setNumberFormat('$#,##0.00');
  ex.getRange('D2:D').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInRange(cat.getRange('A2:A' + (CATEGORIES.length + 1)), true).setAllowInvalid(false).build());
  ex.getRange('F2:F').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['Personal card', 'Personal bank', 'Business card', 'Business bank', 'Cash', 'PayPal', 'Other'], true).build());
  ex.getRange('G2:G').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['Personal funds (owner contribution)', 'Business account'], true).build());
  ex.getRange('H2:H').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['Yes', 'Partial', 'No', 'Ask accountant'], true).build());
  [100, 160, 260, 190, 100, 140, 230, 120, 260, 260].forEach((w, i) => ex.setColumnWidth(i + 1, w));
  ex.getRange(2, 1, 1, 10).setValues([[new Date(), 'Shopify', 'Basic plan – promo month 1 of 3 ($1/mo, then full price)', 'Software & subscriptions', 1, 'Personal card', 'Personal funds (owner contribution)', 'Yes', '', 'Store for Printful merch']]);

  // Income
  const inc = ss.insertSheet('Income', 1);
  const inHead = ['Date', 'Source', 'Description', 'Gross amount', 'Fees withheld', 'Net received', 'Notes'];
  inc.getRange(1, 1, 1, inHead.length).setValues([inHead]);
  header_(inc, inHead.length);
  inc.getRange('A2:A').setNumberFormat('yyyy-mm-dd');
  inc.getRange('D2:F').setNumberFormat('$#,##0.00');
  inc.getRange('B2:B').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['Shopify sales', 'Amazon Associates', 'Etsy', 'Wholesale', 'Other'], true).build());
  inc.getRange('F2').setFormula('=ARRAYFORMULA(IF(D2:D="",,D2:D-N(E2:E)))');
  [100, 160, 260, 120, 120, 120, 260].forEach((w, i) => inc.setColumnWidth(i + 1, w));

  // Summary
  const sm = ss.insertSheet('Summary', 0);
  sm.getRange('A1').setValue('Crop of Now – Books').setFontSize(16).setFontWeight('bold');
  sm.getRange('A3:B8').setValues([
    ['Total spent (all time)', '=SUM(Expenses!E2:E)'],
    ['…of which from personal funds', '=SUMIF(Expenses!G2:G,"Personal funds (owner contribution)",Expenses!E2:E)'],
    ['Spent this year', '=SUMPRODUCT((YEAR(Expenses!A2:A)=YEAR(TODAY()))*(Expenses!A2:A<>"")*Expenses!E2:E)'],
    ['Income (net, all time)', '=SUM(Income!F2:F)'],
    ['Net (income − spend)', '=B6-B3'],
    ['Expenses missing a receipt', '=COUNTIFS(Expenses!B2:B,"<>",Expenses!I2:I,"")'],
  ]);
  sm.getRange('B3:B7').setNumberFormat('$#,##0.00');
  sm.getRange('A3:A8').setFontWeight('bold');
  sm.getRange('A10:C10').setValues([['Spend by category', 'All time', 'This year']]).setFontWeight('bold').setBackground('#1C2733').setFontColor('#F6F0E4');
  const rows = CATEGORIES.map((c, i) => {
    const r = 11 + i;
    return [c[0], `=SUMIF(Expenses!D$2:D,A${r},Expenses!E$2:E)`,
      `=SUMPRODUCT((Expenses!D$2:D=A${r})*(YEAR(Expenses!A$2:A)=YEAR(TODAY()))*(Expenses!A$2:A<>"")*Expenses!E$2:E)`];
  });
  sm.getRange(11, 1, rows.length, 3).setValues(rows);
  sm.getRange(11, 2, rows.length, 2).setNumberFormat('$#,##0.00');
  const m = 11 + rows.length + 1;
  sm.getRange(m, 1, 1, 2).setValues([['Spend by month', 'Amount']]).setFontWeight('bold').setBackground('#1C2733').setFontColor('#F6F0E4');
  sm.getRange(m + 1, 1).setFormula('=IFERROR(QUERY({ARRAYFORMULA(IF(Expenses!A2:A="",,TEXT(Expenses!A2:A,"yyyy-mm"))),Expenses!E2:E},"select Col1, sum(Col2) where Col1 is not null group by Col1 order by Col1 label sum(Col2) \'\'",0),"")');
  sm.getRange(m + 1, 2, 60, 1).setNumberFormat('$#,##0.00');
  sm.getRange('E3').setValue('Receipts folder').setFontWeight('bold');
  sm.getRange('E4').setFormula(`=HYPERLINK("${receipts.getUrl()}","Open Receipts in Drive")`);
  sm.getRange('E6').setValue('How to log a receipt').setFontWeight('bold');
  sm.getRange('E7:E9').setValues([['1. Save the receipt (PDF or photo) into Receipts/<year>'], ['2. Add a row on Expenses'], ['3. Paste the file link into "Receipt link"']]);
  sm.setColumnWidth(1, 260); sm.setColumnWidth(2, 130); sm.setColumnWidth(3, 130); sm.setColumnWidth(5, 380);

  Logger.log('SHEET ' + ss.getUrl());
  Logger.log('FOLDER ' + root.getUrl());
  Logger.log('RECEIPTS ' + receipts.getUrl());
}

function folder_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function header_(sh, n) {
  sh.getRange(1, 1, 1, n).setFontWeight('bold').setBackground('#1C2733').setFontColor('#F6F0E4');
  sh.setFrozenRows(1);
}
