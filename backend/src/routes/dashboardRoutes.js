/**
 * routes/dashboardRoutes.js  —  /api/dashboard/* endpoints
 *
 * GET  /api/dashboard/stats    — enhanced stats for central dashboard
 * GET  /api/search             — global search across invoices, vehicles, distributors, routes
 */

const express = require('express');
const router  = express.Router();
const logger  = require('../utils/logger');
const md      = require('../services/masterDataService');
const { getAllInvoiceMappings, getAllVehicleDeviceMappings } = require('../services/mappingService');
const { getAllDevices } = require('../db/database');
const { getDistanceInKm } = require('../utils/geoUtils');

const HUB_LAT = parseFloat(process.env.HUB_LAT || '17.608504');
const HUB_LON = parseFloat(process.env.HUB_LON || '78.528605');

// ─── GET /api/dashboard/stats ─────────────────────────────────────────────────

router.get('/stats', (req, res) => {
  try {
    const devices    = getAllDevices();
    const invoices   = getAllInvoiceMappings();
    const vehicles   = getAllVehicleDeviceMappings();
    const routes     = md.getAllRoutes();
    const distCount  = md.getAllDistributors().length;

    // Active = vehicle has a device and the device is > 1km from hub
    let active = 0, inactive = 0, noDevice = 0;
    const deviceMap = new Map(devices.map(d => [d.device_name, d]));

    for (const v of vehicles) {
      const device = deviceMap.get(v.deviceName);
      if (!device) { noDevice++; continue; }
      if (!device.latitude || !device.longitude) { inactive++; continue; }
      const dist = getDistanceInKm(
        parseFloat(device.latitude), parseFloat(device.longitude), HUB_LAT, HUB_LON
      );
      if (dist > 1) active++; else inactive++;
    }

    // Invoices in transit = those whose vehicle is actively out for delivery
    const activeVehicleNos = new Set();
    for (const v of vehicles) {
      const device = deviceMap.get(v.deviceName);
      if (!device?.latitude || !device?.longitude) continue;
      const dist = getDistanceInKm(
        parseFloat(device.latitude), parseFloat(device.longitude), HUB_LAT, HUB_LON
      );
      if (dist > 1) activeVehicleNos.add(v.vehicleNo);
    }
    const invoicesInTransit = invoices.filter(inv => activeVehicleNos.has(inv.vehicleNo)).length;

    const mdStatus = md.getMasterDataStatus();

    res.json({
      devices: {
        total:    devices.length,
        active,
        inactive,
        noDevice,
      },
      invoices: {
        total:     invoices.length,
        inTransit: invoicesInTransit,
      },
      vehicles: {
        total:        vehicles.length,
        outForDelivery: active,
        atHub:          inactive,
      },
      routes: {
        total:       routes.length,
        configured:  mdStatus.routes.configured,
      },
      distributors: {
        total:       distCount,
        configured:  mdStatus.hierarchy.configured,
      },
      masterData: mdStatus,
    });
  } catch (err) {
    logger.error('GET /api/dashboard/stats error: ' + err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/search ──────────────────────────────────────────────────────────
// Query params:
//   q    — search term (required)
//   type — optional filter: invoice | vehicle | distributor | route

router.get('/search', (req, res) => {
  try {
    const q    = String(req.query.q || '').toLowerCase().trim();
    const type = String(req.query.type || '').toLowerCase();

    if (!q) return res.json({ results: [] });

    const results = [];
    const invoices = getAllInvoiceMappings();
    const vehicleDevMap = new Map(
      getAllVehicleDeviceMappings().map(v => [v.vehicleNo, v.deviceName])
    );
    const deviceMap = new Map(getAllDevices().map(d => [d.device_name, d]));

    // ── Invoice search ──────────────────────────────────────────────────────
    if (!type || type === 'invoice') {
      const matched = invoices.filter(inv =>
        inv.invoiceNo.toLowerCase().includes(q) ||
        String(inv.vehicleNo || '').toLowerCase().includes(q) ||
        String(inv.chainName || '').toLowerCase().includes(q) ||
        String(inv.customerCode || '').toLowerCase().includes(q)
      );
      for (const inv of matched.slice(0, 20)) {
        const deviceName = vehicleDevMap.get(inv.vehicleNo);
        const device     = deviceName ? deviceMap.get(deviceName) : null;
        results.push({
          type:        'invoice',
          id:          inv.invoiceNo,
          title:       `Invoice ${inv.invoiceNo}`,
          subtitle:    `Vehicle: ${inv.vehicleNo || '—'} | ${inv.chainName || inv.customerCode || ''}`,
          vehicleNo:   inv.vehicleNo,
          deviceName:  deviceName || null,
          location:    device ? [device.city, device.state].filter(Boolean).join(', ') : null,
        });
      }
    }

    // ── Vehicle search ──────────────────────────────────────────────────────
    if (!type || type === 'vehicle') {
      const matchedVehicles = getAllVehicleDeviceMappings().filter(v =>
        v.vehicleNo.toLowerCase().includes(q) ||
        v.deviceName.toLowerCase().includes(q)
      );
      for (const v of matchedVehicles.slice(0, 20)) {
        const device    = deviceMap.get(v.deviceName);
        const vehicleInvoices = invoices.filter(inv => inv.vehicleNo === v.vehicleNo);
        results.push({
          type:         'vehicle',
          id:           v.vehicleNo,
          title:        `Vehicle ${v.vehicleNo}`,
          subtitle:     `Device: ${v.deviceName}`,
          deviceName:   v.deviceName,
          invoiceCount: vehicleInvoices.length,
          location:     device ? [device.city, device.state].filter(Boolean).join(', ') : null,
          battery:      device?.battery || null,
          lastSeen:     device?.last_seen_text || null,
        });
      }
    }

    // ── Distributor search ──────────────────────────────────────────────────
    if (!type || type === 'distributor') {
      const distributors = md.getAllDistributors().filter(d =>
        d.distributorCode.toLowerCase().includes(q) ||
        d.distributorName.toLowerCase().includes(q) ||
        d.asmName.toLowerCase().includes(q) ||
        d.tsoeName.toLowerCase().includes(q) ||
        d.townCity.toLowerCase().includes(q)
      );
      for (const d of distributors.slice(0, 20)) {
        const route = md.getDistributorRoute(d.distributorCode);
        results.push({
          type:     'distributor',
          id:       d.distributorCode,
          title:    `${d.distributorCode} — ${d.distributorName}`,
          subtitle: `ASM: ${d.asmName} | TSOE: ${d.tsoeName} | ${d.townCity}`,
          route:    route || null,
          region:   d.region,
          status:   d.status,
        });
      }
    }

    // ── Route search ────────────────────────────────────────────────────────
    if (!type || type === 'route') {
      const routes = md.getAllRoutes().filter(r =>
        r.routeName.toLowerCase().includes(q) ||
        r.asmName.toLowerCase().includes(q)
      );
      for (const r of routes.slice(0, 20)) {
        results.push({
          type:             'route',
          id:               r.routeName,
          title:            r.routeName,
          subtitle:         `ASM: ${r.asmName} | ${r.distributorCount} distributors`,
          distributorCount: r.distributorCount,
        });
      }
    }

    res.json({
      query:   q,
      total:   results.length,
      results,
    });
  } catch (err) {
    logger.error('GET /api/search error: ' + err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
