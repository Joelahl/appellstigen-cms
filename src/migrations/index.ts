import * as migration_20260610_082040 from './20260610_082040';
import * as migration_20260610_084807 from './20260610_084807';
import * as migration_20260610_114229 from './20260610_114229';
import * as migration_20260610_115833 from './20260610_115833';
import * as migration_20260610_120344 from './20260610_120344';
import * as migration_20260610_123225 from './20260610_123225';
import * as migration_20260610_214425 from './20260610_214425';
import * as migration_20260610_214900 from './20260610_214900';

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
    name: '20260610_115833',
  },
  {
    up: migration_20260610_120344.up,
    down: migration_20260610_120344.down,
    name: '20260610_120344',
  },
  {
    up: migration_20260610_123225.up,
    down: migration_20260610_123225.down,
    name: '20260610_123225',
  },
  {
    up: migration_20260610_214425.up,
    down: migration_20260610_214425.down,
    name: '20260610_214425',
  },
  {
    up: migration_20260610_214900.up,
    down: migration_20260610_214900.down,
    name: '20260610_214900'
  },
];
