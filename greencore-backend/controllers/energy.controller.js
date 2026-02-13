import EnergyData from "../models/EnergyData.model.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

const escapeRegExp = (s = "") =>
  String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getEnergyData = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      source,
      startDate,
      endDate,
      dateFrom,
      dateTo,
      search,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    const filter = { userId: req.user._id };

    if (source) filter.source = String(source).toLowerCase();

    const sDate = startDate || dateFrom;
    const eDate = endDate || dateTo;

    if (sDate || eDate) {
      filter.date = {};
      if (sDate) filter.date.$gte = new Date(sDate);
      if (eDate) filter.date.$lte = new Date(eDate);
    }

    const q = (search || "").trim();
    if (q) {
      const rx = new RegExp(escapeRegExp(q), "i");
      filter.$or = [
        { description: rx },
        { location: rx },
        { notes: rx },
        { source: rx },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [data, total] = await Promise.all([
      EnergyData.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      EnergyData.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items: data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEnergyById = async (req, res, next) => {
  try {
    const entry = await EnergyData.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!entry) throw new NotFoundError("Dato energetico");
    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

export const createEnergy = async (req, res, next) => {
  try {
    const { source, amount, date, description, cost, location, notes } =
      req.body;

    if (!source || amount === undefined || amount === null) {
      throw new ValidationError("Fonte e quantità sono obbligatori.");
    }

    const src = String(source).toLowerCase();
    if (!EnergyData.VALID_SOURCES.includes(src)) {
      throw new ValidationError(
        `Fonte non valida. Fonti ammesse: ${EnergyData.VALID_SOURCES.join(
          ", "
        )}`
      );
    }

    const amt = parseFloat(amount);
    if (Number.isNaN(amt) || amt < 0)
      throw new ValidationError("Quantità non valida.");

    // CO2 NON viene settata qui: la calcola il model pre-save
    const entry = await EnergyData.create({
      userId: req.user._id,
      source: src,
      amount: amt,
      date: date ? new Date(date) : new Date(),
      description: description || "",
      cost: parseFloat(cost) || 0,
      location: location || "",
      notes: notes || "",
    });

    res
      .status(201)
      .json({
        success: true,
        data: entry,
        message: "Dato energetico aggiunto!",
      });
  } catch (error) {
    next(error);
  }
};

export const updateEnergy = async (req, res, next) => {
  try {
    const entry = await EnergyData.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!entry) throw new NotFoundError("Dato energetico");

    const { source, amount, date, description, cost, location, notes } =
      req.body;

    if (source) {
      const src = String(source).toLowerCase();
      if (!EnergyData.VALID_SOURCES.includes(src))
        throw new ValidationError("Fonte non valida.");
      entry.source = src;
    }

    if (amount !== undefined) {
      const amt = parseFloat(amount);
      if (Number.isNaN(amt) || amt < 0)
        throw new ValidationError("Quantità non valida.");
      entry.amount = amt;
    }

    if (date) entry.date = new Date(date);
    if (description !== undefined) entry.description = description;
    if (cost !== undefined) entry.cost = parseFloat(cost) || 0;
    if (location !== undefined) entry.location = location;
    if (notes !== undefined) entry.notes = notes;

    await entry.save();

    res.json({ success: true, data: entry, message: "Dato aggiornato!" });
  } catch (error) {
    next(error);
  }
};

export const deleteEnergy = async (req, res, next) => {
  try {
    const entry = await EnergyData.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!entry) throw new NotFoundError("Dato energetico");
    res.json({ success: true, message: "Dato eliminato." });
  } catch (error) {
    next(error);
  }
};

export const getEnergyStats = async (req, res, next) => {
  try {
    const { period = "30d" } = req.query;
    const userId = req.user._id;

    const days =
      period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [stats, bySource, trend] = await Promise.all([
      EnergyData.aggregate([
        { $match: { userId, date: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalCost: { $sum: "$cost" },
            totalCo2Emitted: { $sum: "$co2Emitted" },
            totalCo2Avoided: { $sum: "$co2Avoided" },
            count: { $sum: 1 },
            avgAmount: { $avg: "$amount" },
          },
        },
      ]),
      EnergyData.aggregate([
        { $match: { userId, date: { $gte: startDate } } },
        {
          $group: {
            _id: "$source",
            totalAmount: { $sum: "$amount" },
            totalCost: { $sum: "$cost" },
            totalCo2Emitted: { $sum: "$co2Emitted" },
            totalCo2Avoided: { $sum: "$co2Avoided" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalAmount: -1 } },
      ]),
      EnergyData.aggregate([
        { $match: { userId, date: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalAmount: { $sum: "$amount" },
            totalCost: { $sum: "$cost" },
            totalCo2Emitted: { $sum: "$co2Emitted" },
            totalCo2Avoided: { $sum: "$co2Avoided" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totals = stats[0] || {
      totalAmount: 0,
      totalCost: 0,
      totalCo2Emitted: 0,
      totalCo2Avoided: 0,
      count: 0,
      avgAmount: 0,
    };

    const renewableSources = EnergyData.RENEWABLE_SOURCES;
    const renewableAmount = bySource
      .filter((s) => renewableSources.includes(s._id))
      .reduce((sum, s) => sum + s.totalAmount, 0);

    const renewablePercentage =
      totals.totalAmount > 0
        ? parseFloat(((renewableAmount / totals.totalAmount) * 100).toFixed(1))
        : 0;

    res.json({
      success: true,
      data: {
        period,
        totals: { ...totals, renewableAmount, renewablePercentage },
        bySource: bySource.map((s) => ({
          source: s._id,
          amount: s.totalAmount,
          cost: s.totalCost,
          co2Emitted: s.totalCo2Emitted,
          co2Avoided: s.totalCo2Avoided,
          count: s.count,
        })),
        trend: trend.map((t) => ({
          date: t._id,
          amount: t.totalAmount,
          cost: t.totalCost,
          co2Emitted: t.totalCo2Emitted,
          co2Avoided: t.totalCo2Avoided,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChartData = async (req, res, next) => {
  try {
    const { period = "30d" } = req.query;
    const userId = req.user._id;

    const days =
      period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyData = await EnergyData.aggregate([
      { $match: { userId, date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            source: "$source",
          },
          amount: { $sum: "$amount" },
          cost: { $sum: "$cost" },
          co2Emitted: { $sum: "$co2Emitted" },
          co2Avoided: { $sum: "$co2Avoided" },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    const chartMap = {};
    dailyData.forEach((d) => {
      const date = d._id.date;
      if (!chartMap[date]) {
        chartMap[date] = {
          date,
          total: 0,
          cost: 0,
          co2Emitted: 0,
          co2Avoided: 0,
          sources: {},
        };
      }
      chartMap[date].total += d.amount;
      chartMap[date].cost += d.cost;
      chartMap[date].co2Emitted += d.co2Emitted || 0;
      chartMap[date].co2Avoided += d.co2Avoided || 0;
      chartMap[date].sources[d._id.source] = d.amount;
    });

    const chart = Object.values(chartMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    res.json({ success: true, chart });
  } catch (error) {
    next(error);
  }
};

export const getRecentEntries = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const entries = await EnergyData.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(limit);
    res.json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};

export default {
  getEnergyData,
  getEnergyById,
  createEnergy,
  updateEnergy,
  deleteEnergy,
  getEnergyStats,
  getChartData,
  getRecentEntries,
};
