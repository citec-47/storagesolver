export const siteConfig = {
  name: 'STORAGE SOLVERS INC.',
  description: 'Straightforward container sales, inspected inventory, and dependable delivery coast to coast.',
  phone: '+1 385-900-0827',
  phoneLink: '+13859000827',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'storangesolver@gmail.com',
  address: '910 E 169TH STREET, WESTFIELD, IN 46074 USA',
  whatsapp: '13859000827',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
};

export const sizeOptions = [
  { value: 'FT10', label: '10 ft', slug: '10ft', use: 'Compact storage' },
  { value: 'FT20', label: '20 ft', slug: '20ft', use: 'The versatile standard' },
  { value: 'FT40', label: '40 ft', slug: '40ft', use: 'Room for more' },
  { value: 'FT45', label: '45 ft', slug: '45ft', use: 'Extra-long capacity' },
  { value: 'FT53', label: '53 ft', slug: '53ft', use: 'Maximum volume' }
] as const;

export const sizeLabels: Record<string, string> = {
  FT10: '10 ft', FT20: '20 ft', FT40: '40 ft', FT45: '45 ft', FT53: '53 ft'
};

export const typeLabels: Record<string, string> = {
  STANDARD: 'Standard', HIGH_CUBE: 'High Cube', OPEN_TOP: 'Open Top', FLAT_RACK: 'Flat Rack',
  REEFER: 'Reefer', SIDE_DOOR: 'Side Door', OFFICE_MODIFIED: 'Office / Modified'
};

export const conditionLabels: Record<string, string> = {
  NEW: 'New', ONE_TRIP: 'One-Trip', CARGO_WORTHY: 'Used - Cargo Worthy',
  WIND_WATER_TIGHT: 'Used - Wind & Water Tight', AS_IS: 'As-Is'
};