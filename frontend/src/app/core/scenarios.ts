import { Connector } from '../shared/domain/connector';
import { Server } from '../shared/domain/server';
import type { ClusterState } from './cluster.store';

const webServer = new Server({
  name: 'Web',
  icon: 'logos/NGINX.svg',
  connectors: [],
  x: 200,
  y: 250,
});
const dbServer = new Server({
  name: 'DB',
  icon: 'logos/PostgresSQL.svg',
  connectors: [],
  x: 500,
  y: 250,
});

export const SCENARIOS = {
  webAndDb: {
    nodes: [webServer, dbServer],
    connections: [new Connector({ outNode: webServer, inNode: dbServer })],
  },
} satisfies Record<string, Partial<ClusterState>>;
