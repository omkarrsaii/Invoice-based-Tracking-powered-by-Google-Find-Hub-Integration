/**
 * kpiService.js
 *
 * Performance KPIs per ASM and per TSOE — built entirely on top of EXISTING
 * in-memory data (masterDataService's ASM/TSOE → distributor groupings, and
 * mappingService's invoice rows). No new sheet, no new sync loop, no
 * persistent store.
 *
 * Reuses the EXACT SAME active-invoice rule already used by the
 * Distributor Portal and the admin Hierarchy distributor flyout (Status
 * AND Remarks both blank) via distributorPortalService.isActiveInvoice —
 * one source of truth, not re-implemented here. Same for date parsing
 * (toComparableDate), since Appointment Date is DD.MM.YYYY same as the
 * other sheet dates.
 */

const logger = require('../utils/logger');
const md     = require('./masterDataService');
const { getAllInvoiceMappings } = require('./mappingService');
const { isActiveInvoice, toComparableDate } = require('./distributorPortalService');

// Start of "today" (local server time) — used for the overdue check.
function startOfTodayMs() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

/**
 * Builds the 5 KPI metrics for an arbitrary set of distributor codes.
 *
 * Definitions (flag to the user if a different definition is wanted —
 * these are reasonable defaults, not confirmed against a written spec):
 *   - completedInvoices = invoices that are NOT active (Status or Remarks
 *     has something filled in). This is the inverse of the active rule,
 *     not a check for one specific status string like "Unloaded", since
 *     the sheet has multiple distinct terminal status values.
 *   - overdueInvoices = active invoices whose Appointment Date has already
 *     passed. Invoices with no parseable Appointment Date are excluded
 *     (not counted as overdue) rather than guessed at.
 */
function buildKpisForDistributorCodes(distributorCodes) {
  const codes = new Set(
    (distributorCodes || []).map(c => String(c || '').trim()).filter(Boolean)
  );
  const all   = getAllInvoiceMappings();
  const group = all.filter(m => codes.has(String(m.distributorCode || '').trim()));

  const totalInvoices    = group.length;
  const activeInvoices   = group.filter(m => isActiveInvoice(m.status, m.remarks));
  const completedInvoices = totalInvoices - activeInvoices.length;
  const completionRate = totalInvoices > 0
    ? Math.round((completedInvoices / totalInvoices) * 1000) / 10 // one decimal place
    : 0;

  const today = startOfTodayMs();
  const overdueInvoices = activeInvoices.filter(m => {
    if (!m.appointmentDate) return false;
    const apptMs = toComparableDate(m.appointmentDate);
    return apptMs > 0 && apptMs < today;
  });

  return {
    distributorCount: codes.size,
    totalInvoices,
    activeInvoices:    activeInvoices.length,
    completedInvoices,
    completionRate,
    overdueInvoices:   overdueInvoices.length,
  };
}

/** KPIs for a single ASM, matched against the same asmName key masterDataService.getAllAsms() uses. */
function getKpisForAsm(asmName) {
  const name = String(asmName || '').trim();
  const asm  = md.getAllAsms().find(a => a.asmName === name);
  if (!asm) {
    logger.warn(`kpiService: no ASM found matching "${name}"`);
    return null;
  }
  return {
    asmName: asm.asmName,
    asmArea: asm.asmArea,
    region:  asm.region,
    ...buildKpisForDistributorCodes(asm.distributors),
  };
}

/** KPIs for a single TSOE, matched against the same tsoeName key masterDataService.getAllTsoes() uses. */
function getKpisForTsoe(tsoeName) {
  const name = String(tsoeName || '').trim();
  const tsoe = md.getAllTsoes().find(t => t.tsoeName === name);
  if (!tsoe) {
    logger.warn(`kpiService: no TSOE found matching "${name}"`);
    return null;
  }
  return {
    tsoeName: tsoe.tsoeName,
    asmName:  tsoe.asmName,
    region:   tsoe.region,
    ...buildKpisForDistributorCodes(tsoe.distributors),
  };
}

module.exports = {
  buildKpisForDistributorCodes,
  getKpisForAsm,
  getKpisForTsoe,
};
