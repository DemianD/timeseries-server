import fs from 'fs';

function getConfig(argv) {
  // Get configuration
  if (argv[3]) {
    try {
      let raw = fs.readFileSync(argv[3]);
      return JSON.parse(raw);
    } catch (e) {
      throw e;
    }
  } else {
    throw new Error('Please provide a configuration file using the -c option');
  }
}

export default {
  getConfig: getConfig
};
