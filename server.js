const apis = require('./lib/apis');
const globals = require('./lib/globals');
const matches = require('./lib/matches');

async function main() {

    // Print server info
    console.info('NODE_ENV: ', process.env.NODE_ENV);

    // Set the matches
    await matches.init(globals);
  
    // Serve up those tasty APIs
    apis.init(globals, matches); 
  
  }
  
  
  main();