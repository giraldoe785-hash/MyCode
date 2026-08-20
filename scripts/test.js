import fs from 'fs';
console.log("Testing ES Module runner: OK");
fs.writeFileSync("scripts/test_out.txt", "OK ES MODULE", "utf8");