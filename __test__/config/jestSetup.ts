export const LIVE = process.env.LIVE === 'true'

import { someFunction } from './mocks/someFunction'

if (!LIVE) {
  jest.mock('../../src/core/utils/someFunction', () => {
    return {
      launchIndexing: jest.fn(someFunction),
    }
  })
}
