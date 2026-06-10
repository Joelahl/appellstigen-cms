import * as migration_20260610_082040 from './20260610_082040';
import * as migration_20260610_084807 from './20260610_084807';
import * as migration_20260610_114229 from './20260610_114229';
import * as migration_20260610_115833 from './20260610_115833';

export const migrations = [
  {
    up: migration_20260610_082040.up,
    down: migration_20260610_082040.down,
    name: '20260610_082040',
  },
  {
    up: migration_20260610_084807.up,
    down: migration_20260610_084807.down,
    name: '20260610_084807',
  },
  {
    up: migration_20260610_114229.up,
    down: migration_20260610_114229.down,
    name: '20260610_114229',
  },
  {
    up: migration_20260610_115833.up,
    down: migration_20260610_115833.down,
    name: '20260610_115833'
  },
];
