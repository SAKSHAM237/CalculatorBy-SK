export type AngleUnit = 'DEG' | 'RAD' | 'GRAD';

export type CalculatorMode = 'BASIC' | 'SCIENTIFIC' | 'PROGRAMMER';

export type LayoutProfile = 'POCKET' | 'ENGINEERING';

export interface AppSettings {
  precision: number;
  angleUnit: AngleUnit;
  layoutProfile: LayoutProfile;
  hapticsEnabled: boolean;
}

export interface SocialLink {
  category: string;
  label: string;
  iconKey: string;
  emoji?: string;
  url: string;
  handle: string;
}

export type ProgrammerBase = 2 | 8 | 10 | 16;

export type ProgrammerOp =
  | 'AND'
  | 'OR'
  | 'XOR'
  | 'NOT'
  | 'NAND'
  | 'NOR'
  | 'SHL'
  | 'SHR'
  | 'ROL'
  | 'ROR';
