import mongoose from "mongoose";
import EnergyData from "../models/EnergyData.model.js";

const MONGO_URI = process.env.MONGO_URI;
const DRY_RUN = process.env.DRY_RUN === "1";
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 500);

if (!MONGO_URI) {
  console.error("❌ MONGO_URI mancante");
  process.exit(1);
}

function computeCO2(source, amount) {
  const src = String(source || "rete").toLowerCase();
  const amt = Number(amount || 0);

  const factor = EnergyData.CO2_FACTORS[src] ?? EnergyData.CO2_FACTORS.rete;
  const emitted = Number((amt * factor).toFixed(4));
  const avoided = EnergyData.RENEWABLE_SOURCES.includes(src)
    ? Number((amt * (EnergyData.CO2_FACTORS.rete - factor)).toFixed(4))
    : 0;

  return { emitted, avoided };
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connesso DB");
  console.log(`DRY_RUN=${DRY_RUN} BATCH=${BATCH_SIZE}`);

  const total = await EnergyData.countDocuments();
  let processed = 0;
  let updated = 0;

  while (processed < total) {
    const docs = await EnergyData.find()
      .skip(processed)
      .limit(BATCH_SIZE)
      .select("_id source amount co2Emitted co2Avoided")
      .lean();

    const ops = [];

    for (const d of docs) {
      const { emitted, avoided } = computeCO2(d.source, d.amount);
      if (d.co2Emitted !== emitted || d.co2Avoided !== avoided) {
        ops.push({
          updateOne: {
            filter: { _id: d._id },
            update: { $set: { co2Emitted: emitted, co2Avoided: avoided } },
          },
        });
      }
    }

    if (ops.length && !DRY_RUN) {
      const res = await EnergyData.bulkWrite(ops);
      updated += res.modifiedCount;
    } else {
      updated += ops.length;
    }

    processed += docs.length;
    console.log(`➡️ ${processed}/${total} | update: ${updated}`);
  }

  console.log("✅ MIGRAZIONE COMPLETATA");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
