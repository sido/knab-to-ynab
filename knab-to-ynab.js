var fs = require('fs');
var csv = require('csv');
var moment = require('moment');

var pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

csv()
.from.path(__dirname+'/knab.csv', { delimiter: ';', escape: '"' })
.to.stream(fs.createWriteStream(__dirname+'/ynab.csv'), { delimiter: ',', escape: '"' })
.transform(function(row){
	console.log("\n" + '          original:  '+JSON.stringify(row));

	var transaction = [];

	var date = moment(row[1], "DD-MM-YYYY").format("DD/MM/YY");
	transaction.push(date);

	var payee = row[6].trim();
	transaction.push(payee);

	var category = '';
	transaction.push(category);

	var memo = row[9].trim();
	transaction.push(memo);

	var outflow = '';
	var inflow = '';
	if (row[3] === 'D') {
		var outflow = row[4];
	} else {
		var inflow = row[4];
	}
	transaction.push(outflow);
	transaction.push(inflow);

  row.unshift(row.pop());
  return transaction;
})
.on('record', function(row,index){
  console.log('#'+pad(index, 4)+" ->  converted: " + JSON.stringify(row));
})
.on('close', function(count){
  // when writing to a file, use the 'close' event
  // the 'end' event may fire before the file has been written
  if (count == 1)
  	console.log("\nConverted 1 transaction.\n");
  else
  	console.log("\nConverted "+count+" transactions.\n");
})
.on('error', function(error){
  console.log(error.message);
});