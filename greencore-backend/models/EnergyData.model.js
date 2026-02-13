import mongoose from 'mongoose';

const VALID_SOURCES = ['solare', 'eolico', 'idroelettrico', 'biomassa', 'geotermico', 'rete', 'altro'];
const RENEWABLE_SOURCES = ['solare', 'eolico', 'idroelettrico', 'biomassa', 'geotermico'];
const CO2_FACTORS = {
  solare: 0.02, eolico: 0.01, idroelettrico: 0.004,
  biomassa: 0.23, geotermico: 0.038, rete: 0.475, altro: 0.5,
};

const energyDataSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    source: { type: String, required: true, enum: VALID_SOURCES, lowercase: true },
    amount: { type: Number, required: true, min: 0.01, max: 999999 },
    cost: { type: Number, default: 0, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    location: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    co2Emitted: { type: Number, default: 0 },
    co2Avoided: { type: Number, default: 0 },
  },
  { timestamps: true }
);

energyDataSchema.index({ userId: 1, date: -1 });
energyDataSchema.index({ userId: 1, source: 1 });

energyDataSchema.pre('save', function (next) {
  const factor = CO2_FACTORS[this.source] || CO2_FACTORS.rete;
  this.co2Emitted = parseFloat((this.amount * factor).toFixed(4));
  if (RENEWABLE_SOURCES.includes(this.source)) {
    this.co2Avoided = parseFloat((this.amount * (CO2_FACTORS.rete - factor)).toFixed(4));
  } else {
    this.co2Avoided = 0;
  }
  next();
});

const EnergyData = mongoose.model('EnergyData', energyDataSchema);
EnergyData.VALID_SOURCES = VALID_SOURCES;
EnergyData.RENEWABLE_SOURCES = RENEWABLE_SOURCES;
EnergyData.CO2_FACTORS = CO2_FACTORS;

export default EnergyData;
