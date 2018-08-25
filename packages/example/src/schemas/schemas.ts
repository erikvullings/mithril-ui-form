import * as edxl from './edxl-de-key.json';
import * as simulation_request_unittransport from './simulation_request_unittransport-value.json';
import * as simulation_request_itemchangestate from './simulation_request_itemchangestate-value.json';
import * as simulation_entity_post from './simulation_entity_post-value.json';
import * as simulation_entity_item from './simulation_entity_item-value.json';
import * as simulation_connection_unit from './simulation_connection_unit-value.json';
import * as simulation_connection_unit_connection from './simulation_connection_unit_connection-value.json';
import * as system_topic_create_request from './system_topic_create_request-value.json';
import * as system_timing from './system_timing-value.json';
import * as system_timing_control from './system_timing_control-value.json';
import * as system_logging from './system_logging-value.json';
import * as system_map_layer_update from './system_map_layer_update-value.json';
import * as system_large_data_update from './system_large_data_update-value.json';
import * as system_heartbeat from './system_heartbeat-value.json';
import * as system_configuration from './system_configuration-value.json';
import * as system_admin_heartbeat from './system_admin_heartbeat-value.json';
import * as simulation_entity_station from './simulation_entity_station-value.json';
import * as standard_mlp from './standard_mlp-value.json';
import * as geojson from './standard_geojson-xvr-value.json';
import * as standard_geojson from './standard_geojson-value.json';
import * as standard_emsi from './standard_emsi-value.json';
import * as standard_cap from './standard_cap-value.json';
import * as system_topic_access_invite from './system_topic_access_invite-value.json';
import { IAvroRecordType } from 'mithril-avro-form-component';

export const avroSchemas: { [key: string]: IAvroRecordType } = {
  edxl,
  simulation_request_unittransport,
  simulation_request_itemchangestate,
  simulation_entity_post,
  simulation_entity_item,
  simulation_connection_unit,
  simulation_connection_unit_connection,
  system_topic_create_request,
  system_timing,
  system_timing_control,
  system_logging,
  system_map_layer_update,
  system_large_data_update,
  system_heartbeat,
  system_configuration,
  system_admin_heartbeat,
  simulation_entity_station,
  standard_mlp,
  geojson,
  standard_geojson,
  standard_emsi,
  standard_cap,
  system_topic_access_invite,
};
