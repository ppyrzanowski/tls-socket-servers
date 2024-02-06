export interface JULIAN_INTERFACE {
  julian: true
}

export function JULIAN_FN() {
  return true;
}

export interface TlsCipherSuiteDTO {
  description: string;
  recommended: boolean | null;
  reference: string;
}