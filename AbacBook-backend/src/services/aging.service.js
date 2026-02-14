import Sale from "../modules/sale.model.js";
import Purchase from "../modules/purchase.model.js";
import Customer from "../modules/customer.model.js";
import Supplier from "../modules/supplier.model.js";

// =======================================================
// Helper: Calculate Day Difference
// =======================================================
function getDaysDifference(fromDate, toDate) {
  const diff = toDate.getTime() - fromDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// =======================================================
// Helper: Initialize Party Bucket
// =======================================================
function initPartyBucket(name) {
  return {
    name,
    current: 0,
    days1_30: 0,
    days31_60: 0,
    days61_90: 0,
    over90: 0,
    total: 0,
  };
}

// =======================================================
// RECEIVABLE AGING
// =======================================================
export const getReceivableAging = async (asOfDate) => {
  const date = asOfDate
    ? new Date(new Date(asOfDate).setHours(23, 59, 59, 999))
    : new Date();

  const sales = await Sale.find({
    date: { $lte: date },
  }).populate("customerId");

  const partyMap = {};

  for (const sale of sales) {
    const outstanding =
      sale.totalAmount - sale.totalPaid - sale.totalReturned;

    if (outstanding <= 0) continue;

    const days = getDaysDifference(new Date(sale.date), date);
    const customerName = sale.customerId?.name || "Unknown";

    if (!partyMap[customerName]) {
      partyMap[customerName] = initPartyBucket(customerName);
    }

    if (days === 0) {
      partyMap[customerName].current += outstanding;
    } else if (days >= 1 && days <= 30) {
      partyMap[customerName].days1_30 += outstanding;
    } else if (days >= 31 && days <= 60) {
      partyMap[customerName].days31_60 += outstanding;
    } else if (days >= 61 && days <= 90) {
      partyMap[customerName].days61_90 += outstanding;
    } else {
      partyMap[customerName].over90 += outstanding;
    }

    partyMap[customerName].total += outstanding;
  }

  const parties = Object.values(partyMap);

  const totals = parties.reduce(
    (acc, party) => {
      acc.current += party.current;
      acc.days1_30 += party.days1_30;
      acc.days31_60 += party.days31_60;
      acc.days61_90 += party.days61_90;
      acc.over90 += party.over90;
      acc.grandTotal += party.total;
      return acc;
    },
    {
      current: 0,
      days1_30: 0,
      days31_60: 0,
      days61_90: 0,
      over90: 0,
      grandTotal: 0,
    }
  );

  return { parties, totals };
};

// =======================================================
// PAYABLE AGING
// =======================================================
export const getPayableAging = async (asOfDate) => {
  const date = asOfDate
    ? new Date(new Date(asOfDate).setHours(23, 59, 59, 999))
    : new Date();

  const purchases = await Purchase.find({
    date: { $lte: date },
  }).populate("supplierId");

  const partyMap = {};

  for (const purchase of purchases) {
    const outstanding =
      purchase.totalAmount - purchase.totalPaid - purchase.totalReturned;

    if (outstanding <= 0) continue;

    const days = getDaysDifference(new Date(purchase.date), date);
    const supplierName = purchase.supplierId?.name || "Unknown";

    if (!partyMap[supplierName]) {
      partyMap[supplierName] = initPartyBucket(supplierName);
    }

    if (days === 0) {
      partyMap[supplierName].current += outstanding;
    } else if (days >= 1 && days <= 30) {
      partyMap[supplierName].days1_30 += outstanding;
    } else if (days >= 31 && days <= 60) {
      partyMap[supplierName].days31_60 += outstanding;
    } else if (days >= 61 && days <= 90) {
      partyMap[supplierName].days61_90 += outstanding;
    } else {
      partyMap[supplierName].over90 += outstanding;
    }

    partyMap[supplierName].total += outstanding;
  }

  const parties = Object.values(partyMap);

  const totals = parties.reduce(
    (acc, party) => {
      acc.current += party.current;
      acc.days1_30 += party.days1_30;
      acc.days31_60 += party.days31_60;
      acc.days61_90 += party.days61_90;
      acc.over90 += party.over90;
      acc.grandTotal += party.total;
      return acc;
    },
    {
      current: 0,
      days1_30: 0,
      days31_60: 0,
      days61_90: 0,
      over90: 0,
      grandTotal: 0,
    }
  );

  return { parties, totals };
};
