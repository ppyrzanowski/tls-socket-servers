export interface TlsCipherSuiteDTO {
  hex_value_uint16: number;
  hex_value_uint8_array: [number, number];
  hex_value_str: string;
  description: string;
  recommended: boolean | null;
  reference: string;
}