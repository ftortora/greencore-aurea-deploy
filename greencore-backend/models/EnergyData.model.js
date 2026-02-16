import mongoose from 'mongoose';

const VALID_SOURCES = ['solare', 'eolico', 'idroelettrico', 'biomassa', 'geotermico', 'rete', 'altro'];
const RENEWABLE_SOURCES = ['solare', 'eolico', 'idroelettrico', 'biomassa', 'geotermico'];

/**
 * Fattori di emissione personalizzati (kg CO2/kWh)
 * Dati calibrati sul mix energetico nazionale italiano 2024.
 */
const CO2_FACTORS = {
    solare: 0.0215,
    eolico: 0.0118,
    idroelettrico: 0.0054,
    biomassa: 0.2282,
    geotermico: 0.0376,
    rete: 0.4431, // Standard ISPRA per mix nazionale
    altro: 0.4950,
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

energyDataSchema.pre('save', function (next) {
    const factor = CO2_FACTORS[this.source] || CO2_FACTORS.rete;
    // Precisione a 4 decimali per evitare glitch nei grafici Recharts
    this.co2Emitted = parseFloat((this.amount * factor).toFixed(4));

    if (RENEWABLE_SOURCES.includes(this.source)) {
        this.co2Avoided = parseFloat((this.amount * (CO2_FACTORS.rete - factor)).toFixed(4));
    } else {
        this.co2Avoided = 0;
    }
    next();
});

export default mongoose.model('EnergyData', energyDataSchema);