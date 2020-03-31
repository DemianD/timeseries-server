import CommunicationManager from '../lib/CommunicationManager.js';
import Configuration from '../lib/Configuration.js';
import SourceReader from '../lib/SourceReader.js';
import DataEventManager from '../lib/DataEventManager.js';

const loadInterfaceModules = async (source, commManager) => {
  Object.values(source.interfaces).map(async interfaceModule => {
    let { default: Interface } = await import(process.cwd() + '/' + interfaceModule);
    new Interface(source, commManager);
  });
};

try {
  // Read config file
  let config = Configuration.getConfig(process.argv);

  // Init Communication Manager module
  let commManager = new CommunicationManager(config);

  // Process data source
  config.sources.forEach(source => {
    // Load multidimensional interfaces
    loadInterfaceModules(source, commManager);

    let sourceReader = new SourceReader(source, config.hostName + config.liveUriPath);

    sourceReader.on('data', data => {
      // Launch data event towards predefined interfaces through Data Event Manager module
      DataEventManager.push(`data-${source.name}`, data);
    });
  });

  // TODO: Define a way to configure RDF input streams
  // Listen for data on standard input
  // let stdin = process.openStdin();
  // stdin.on('data', chunk => writePerObservation(chunk));

  // Launch Web server for polling interfaces
  let app = commManager.app;
  let http = commManager.http;
  let ws = commManager.ws;

  app.use(http.routes()).use(http.allowedMethods());
  app.ws.use(ws.routes()).use(ws.allowedMethods());
  app.listen(config.httpPort);
} catch (e) {
  console.error(e);
  process.exit(1);
}
