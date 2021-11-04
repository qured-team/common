/*  

All types of Logging Severity :

    DEFAULT: 'DEFAULT'
    DEBUG: 'DEBUG'
    INFO: 'INFO'
    NOTICE: 'NOTICE'
    WARNING: 'WARNING'
    ERROR: 'ERROR'
    CRITICAL: 'CRITICAL'
    ALERT: 'ALERT'
    EMERGENCY: 'EMERGENCY'

*/

/* @todo: Review emergency process */

export const LOGS_SEVERITY = [
  { severity: 'DEFAULT', status: [] },
  {
    severity: 'NOTICE',
    status: [100, 101, 102, 103]
  },
  {
    severity: 'INFO',
    status: [200, 201, 202, 203, 204, 205, 206, 207, 208, 226]
  },
  {
    severity: 'WARNING',
    status: [300, 301, 302, 303, 304, 305, 306, 307, 308]
  },
  {
    severity: 'ERROR',
    status: [
      400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414,
      415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451
    ]
  },
  {
    severity: 'CRITICAL',
    status: [500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511]
  }
]

// @todo: get monolith error codes

export const MONOLITH_ERROR_CODE = {}
