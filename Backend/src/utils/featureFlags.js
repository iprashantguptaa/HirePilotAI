const featureFlagModel = require("../models/featureFlag.model")

/**
 * Checks whether a feature flag is enabled. Defaults to enabled if the
 * flag has never been created (e.g. on a fresh install before an admin
 * has visited the feature flags page) so nothing is silently disabled
 * by omission.
 */
async function isFeatureEnabled(key) {
    const flag = await featureFlagModel.findOne({ key })
    if (!flag) return true
    return flag.enabled
}

module.exports = { isFeatureEnabled }
