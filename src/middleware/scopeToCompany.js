const ROLES = require("../utils/roles");

/**
 * Attaches req.companyScope: null for Super Admin (no restriction),
 * or the user's own companyId for everyone else. Every future
 * repository call for Company/Plant/Product/Batch data should apply
 * this as a filter - that's what makes "Company Admin can never see
 * another company's data" enforced in one place instead of trusted
 * to every individual controller.
 */
function scopeToCompany(req, res, next) {
  req.companyScope = req.user.role === ROLES.SUPER_ADMIN ? null : req.user.companyId;
  next();
}

module.exports = scopeToCompany;
