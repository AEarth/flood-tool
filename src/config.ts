import FeatureSet from "esri/rest/support/FeatureSet";
import {
  ImmutableArray,
  ImmutableObject,
  UseDataSource,
} from "jimu-core";
import { LinearUnits } from "jimu-ui/advanced/lib/map/components/jimu-draw/components/measurements/constraints";

export interface RestEndPoint {
  featureServiceId: string;
  featureServer?: string;
  imageServer?: string;
  buffer?: number;
  buffer_units?: LinearUnits;
  orderByFields?: ImmutableArray<string>;
  whereClause: string;
  resultRecordCount?: number;
  masterService: boolean;
}

export interface RiskCard {
  cardType: "high" | "medium" | "low" | "none";
  featureServiceId: string;
  indicatorField: string;
  indicatorValues: ImmutableArray<string>;
  cardHeader: string;
  cardDescription: string;
  linkLabel: string;
  linkUrl: string;
}

export interface Flood3dCard {
  featureServiceId: string;
  lagField: string;
  hagField: string;
  wseField: string;
  noResultMessage: string;
  nullWSEMessage: string;
  WSEGreaterThanLAGMessage: string;
  WSELessThanLAGMessage: string;
}

export interface DisplaySection {
  sectionLabel: string;
  displayFields?: ImmutableArray<DisplayField>;
  riskCards?: RiskCard[];
  flood3dCard?: Flood3dCard;
  displayType?: "data" | "riskCard" | "flood3dCard";
}

export interface DisplayField {
  featureServiceId?: string;
  label?: string;
  staticValue?: string; // when static value is available valueField value will be ignored
  actionValue?: "open3dModel"; // those custom actions need to be implemented and handled in the code. Otherwise no action will be triggered.
  valueField?: string;
  display: "keyValue" | "link" | "linkReference";
  format: "normal" | "date";
  linkLabel?: string;
  tooltip?: string;
  linkReference1Label?: string;
  linkReference2Label?: string;
  linkReference3Label?: string;
  linkReference1Url?: string;
  linkReference2Url?: string;
  linkReference3Url?: string;
}

export interface Config {
  coordinateDecimal: number;
  restEndPoints?: ImmutableArray<RestEndPoint>;
  displaySections?: DisplaySection[];
  endPoints?: ImmutableArray<RestEndPoint>;
  useDataSourcesEnabled?: boolean;
  useDataSources?: UseDataSource[];
  showLatLong: boolean;
  showExternalMapLinks: boolean;
  showAddress: boolean;
  show3dView: boolean;
}

export interface FloodData {
  endPoint: RestEndPoint;
  data: FeatureSet;
}

export interface Flood3dData {
  message: string;
  waterElevation: number;
  lat: number;
  long: number;
  address: string;
  show3DModel: boolean;
}

export type IMConfig = ImmutableObject<Config>;
