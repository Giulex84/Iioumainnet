import { verifyPiUser, piServerRequest, apiError } from '../lib/pi.js';
import { createSupportHandler } from '../lib/support-payment.js';
import { safeRecordMetric } from '../lib/metrics.js';
export default createSupportHandler({verifyPiUser,piServerRequest,apiError,network:'Pi Network',memo:'Support IIOU Mainnet',legacyAmount:0.01,metric:safeRecordMetric});
