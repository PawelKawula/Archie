export type PacketSnapshot = {
  id: string;
  content: string;
};

export type ConnectionSnapshot = {
  outQueue: PacketSnapshot[];
  transitQueue: PacketSnapshot[];
  arrivedQueue: PacketSnapshot[];
  outQueueSize: number;
  transitQueueSize: number;
  arrivedQueueSize: number;
};

export type ConnectorSnapshot = NodeSnapshot & {
  fromNodeId: string;
  toNodeId: string;
  connection: ConnectionSnapshot;
};

export type NodeSnapshot = {
  id: string;
  type: string;
  name: string;
  icon: string;
  x: number;
  y: number;
};

export type PacketSourceSnapshot = NodeSnapshot & {
  connectorId: string;
  interval: number;
};

export type ClusterSnapshot = {
  tick: number;
  nodes: NodeSnapshot[];
  connections: ConnectorSnapshot[];
};
