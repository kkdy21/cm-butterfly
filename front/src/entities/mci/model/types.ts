export interface MciResponseData {
  mci: IMci[];
}

export type McisTableType =
  | 'name'
  | 'id'
  | 'status'
  | 'provider'
  | 'countTotal'
  | 'countRunning'
  | 'countTerminated'
  | 'countSuspended'
  | 'description'
  | 'deploymentAlgorithm'
  | 'type'
  | 'action';

interface Location {
  display: string;
  latitude: number;
  longitude: number;
}

interface RegionZoneInfo {
  assignedRegion: string;
  assignedZone: string;
}

interface RegionDetail {
  regionId: string;
  regionName: string;
  description: string;
  location: Location;
  zones: string[];
}

interface ConnectionConfig {
  configName: string;
  providerName: string;
  driverName: string;
  credentialName: string;
  credentialHolder: string;
  regionZoneInfoName: string;
  regionZoneInfo: RegionZoneInfo;
  regionDetail: RegionDetail;
  regionRepresentative: boolean;
  verified: boolean;
}

export interface IVm {
  resourceType: string;
  id: string;
  uid: string;
  name: string;
  subGroupId: string;
  location: Location;
  status: string;
  targetStatus: string;
  targetAction: string;
  monAgentStatus: string;
  networkAgentStatus: string;
  systemMessage: string;
  createdTime: string;
  label: any; // Assuming label can be any type
  description: string;
  region: {
    Region: string;
    Zone: string;
  };
  publicIP: string;
  sshPort: string;
  publicDNS: string;
  privateIP: string;
  privateDNS: string;
  rootDiskType: string;
  rootDiskSize: string;
  rootDeviceName: string;
  connectionName: string;
  connectionConfig: ConnectionConfig;
  specId: string;
  cspSpecName: string;
  imageId: string;
  cspImageName: string;
  vNetId: string;
  cspVNetId: string;
  subnetId: string;
  cspSubnetId: string;
  networkInterface: string;
  securityGroupIds: string[];
  dataDiskIds: any; // Assuming dataDiskIds can be any type
  sshKeyId: string;
  cspSshKeyId: string;
}

interface StatusCount {
  countTotal: number;
  countCreating: number;
  countRunning: number;
  countFailed: number;
  countSuspended: number;
  countRebooting: number;
  countTerminated: number;
  countSuspending: number;
  countResuming: number;
  countTerminating: number;
  countUndefined: number;
}

interface Label {
  'sys.description': string;
  'sys.id': string;
  'sys.labelType': string;
  'sys.manager': string;
  'sys.name': string;
  'sys.namespace': string;
  'sys.uid': string;
}

export interface IMci {
  resourceType: string;
  id: string;
  uid: string;
  name: string;
  status: string;
  statusCount: StatusCount;
  targetStatus: string;
  targetAction: string;
  installMonAgent: string;
  configureCloudAdaptiveNetwork: string;
  label: Label;
  systemLabel: string;
  systemMessage: string;
  description: string;
  vm: IVm[];
  newVmList: any; // Assuming newVmList can be any type
}

// Usage example:
