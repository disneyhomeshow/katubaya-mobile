/**
 * Domain Contracts - Barrel Export
 */

import { version } from '../../../package.json';

export * from './types';
export * from './schemas';

export const SCHEMA_VERSION = '1.1.0';
export const APP_VERSION: string = version;
