const fs = require('fs');
const crypto = require('crypto');

const randomValue = crypto
  .createHmac('sha256', crypto.randomBytes(128).toString('base64'))
  .update('VersionId')
  .digest('hex');

const args = process.argv.slice(2);
const path = args.find((arg) => arg.startsWith('--path=')).split('=')?.[1];

const fileName = path ?? 'public/versionId.txt';

fs.writeFile(fileName, randomValue.toString(), 'utf8', (err) => {
  if (err) {
    console.error('Error writing to file:', err);
    return;
  }
  console.log(`Successfully wrote "${randomValue}" to ${fileName}`);
});
