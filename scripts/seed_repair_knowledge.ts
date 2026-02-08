/**
 * Seed script to populate the repair_knowledge table with automotive repair information
 * This provides the knowledge base for the RAG system
 */

import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Automotive repair knowledge base
const repairKnowledge = [
  {
    title: 'CV Joint Failure - Diagnosis and Repair',
    category: 'drivetrain',
    content: `CV (Constant Velocity) joints are critical components in front-wheel drive vehicles. Common symptoms include:
- Clicking or popping noise when turning, especially at sharp angles
- Vibration during acceleration
- Grease on the inside of wheel rims
- Torn CV boot with grease leaking

Diagnosis: Test drive the vehicle in a figure-8 pattern. Listen for clicking sounds. Inspect CV boots for tears or damage.

Common causes: Worn CV joints, damaged CV boots allowing dirt/moisture contamination, age and mileage.

Repair cost: $300-$800 per axle including labor. Parts: $150-$400, Labor: 1.5-3 hours.

Prevention: Regular inspection of CV boots, immediate replacement of torn boots before joint damage occurs.`,
  },
  {
    title: 'Brake Pad Wear - Symptoms and Replacement',
    category: 'brakes',
    content: `Brake pads wear naturally over time and require periodic replacement. Symptoms include:
- Squealing or grinding noise when braking
- Reduced braking performance
- Brake warning light on dashboard
- Vibration or pulsation when braking
- Vehicle pulls to one side during braking

Diagnosis: Visual inspection through wheel spokes or removal of wheels. Measure pad thickness (should be >3mm).

Typical wear indicators: Squealer tabs create noise when pads reach 2-3mm thickness.

Replacement cost: $150-$300 per axle including labor. Parts: $50-$150, Labor: 0.5-1.5 hours.

Best practice: Replace pads on both sides of an axle simultaneously. Inspect rotors for wear/warping.`,
  },
  {
    title: 'Alternator Failure - Diagnosis and Replacement',
    category: 'electrical',
    content: `The alternator charges the battery and powers electrical systems while the engine runs. Failure symptoms:
- Battery warning light illuminated
- Dim or flickering headlights
- Electrical accessories not working properly
- Dead battery after driving
- Whining or grinding noise from alternator
- Burning smell from alternator area

Diagnosis: Test battery voltage (should be 12.4-12.7V off, 13.8-14.4V running). Load test alternator output. Check for loose/worn drive belt.

Common causes: Worn bearings, failed voltage regulator, damaged diodes, worn brushes.

Replacement cost: $400-$800 including labor. Parts: $250-$600, Labor: 1-2 hours.

Note: Test battery condition before replacing alternator as a weak battery can cause similar symptoms.`,
  },
  {
    title: 'Engine Misfire - P0300 Code Diagnosis',
    category: 'engine',
    content: `Engine misfires occur when combustion fails in one or more cylinders. Symptoms include:
- Check engine light (often with P0300-P0308 codes)
- Rough idle or engine shaking
- Loss of power during acceleration
- Increased fuel consumption
- Smell of unburned fuel

Common causes (in order of likelihood):
1. Worn spark plugs (most common)
2. Faulty ignition coils
3. Fuel injector problems
4. Low compression (worn piston rings, valve issues)
5. Vacuum leaks
6. Bad fuel quality

Diagnosis: Read diagnostic codes to identify which cylinder(s). Inspect spark plugs for wear, fouling. Test ignition coils. Check compression.

Repair costs vary:
- Spark plugs: $100-$300 (parts $50-$150, labor 0.5-1 hour)
- Ignition coils: $150-$400 per coil
- Fuel injectors: $300-$900 depending on count`,
  },
  {
    title: 'Transmission Slipping - Diagnosis and Solutions',
    category: 'transmission',
    content: `Transmission slipping occurs when gears don't engage properly or RPMs increase without corresponding speed increase. Symptoms:
- Engine RPMs increase but vehicle doesn't accelerate proportionally
- Delayed engagement when shifting into drive/reverse
- Rough or jerky shifting
- Check engine light (transmission codes)
- Burning smell from transmission
- Transmission fluid leaking

Diagnosis: Check transmission fluid level and condition (should be red/pink, not brown/burnt). Scan for transmission codes. Test drive to replicate symptoms.

Common causes:
- Low or contaminated transmission fluid
- Worn clutch plates or bands
- Torque converter failure
- Solenoid problems
- Internal transmission wear

Solutions:
- Fluid change/flush: $150-$250
- Solenoid replacement: $200-$500
- Transmission rebuild: $1,500-$3,500
- Transmission replacement: $2,500-$5,000+

Prevention: Regular transmission fluid changes per manufacturer schedule (typically 30k-60k miles).`,
  },
  {
    title: 'Timing Belt Replacement - Critical Preventive Maintenance',
    category: 'engine',
    content: `Timing belts synchronize engine valve and piston movement. Failure can cause catastrophic engine damage. Key information:

Replacement interval: Check owner's manual. Typically 60k-100k miles or 5-7 years, whichever comes first.

Warning signs (often none until failure):
- Ticking noise from engine
- Misfires
- Oil leaking from front of engine
- Engine won't start

Risk of not replacing: If timing belt breaks in an "interference engine", pistons can hit valves causing $2,000-$5,000+ in damage.

Replacement cost: $500-$1,200 including labor. Parts: $150-$300, Labor: 3-6 hours.

Best practice: Replace water pump, tensioners, and idler pulleys at same time since labor is already done. This adds $150-$300 but prevents future failures.

Prevention: Replace on schedule, never skip this service.`,
  },
  {
    title: 'Coolant System Issues - Overheating Prevention',
    category: 'cooling',
    content: `The cooling system prevents engine overheating. Common problems include:

Symptoms of cooling system failure:
- Temperature gauge reading high
- Steam from engine bay
- Sweet smell (coolant leak)
- Heater not working properly
- Coolant puddles under vehicle

Common causes:
- Low coolant level
- Thermostat stuck closed
- Radiator blockage or damage
- Water pump failure
- Blown head gasket
- Cooling fan not working

Diagnosis: Check coolant level (when cold). Pressure test system for leaks. Test thermostat operation. Check cooling fan operation.

Repair costs:
- Coolant flush: $100-$150
- Thermostat: $150-$300
- Water pump: $300-$750
- Radiator: $400-$900
- Head gasket: $1,500-$2,500

Prevention: Maintain proper coolant level, flush coolant per manufacturer schedule (typically 30k-50k miles).`,
  },
  {
    title: 'Suspension Noise - Struts and Shocks',
    category: 'suspension',
    content: `Struts and shocks dampen vehicle motion for comfortable ride and handling. Failure symptoms:

- Clunking or knocking over bumps
- Excessive bouncing after hitting bumps
- Nose diving when braking
- Uneven tire wear
- Poor handling or body roll in turns
- Fluid leaking from strut/shock body

Test: Push down hard on each corner of vehicle. Should bounce once and settle. Multiple bounces indicate worn dampers.

Common causes: Normal wear over time (typically 50k-100k miles), damage from potholes, torn dust boots allowing contamination.

Replacement cost:
- Rear shocks: $200-$500 per pair
- Front struts: $400-$800 per pair
- Complete strut assemblies (quicker install): $500-$1,000 per pair

Note: Always replace in pairs (both front or both rear) for balanced handling.

Impact: Worn struts/shocks increase stopping distance and reduce vehicle control.`,
  },
  {
    title: 'Battery Testing and Replacement',
    category: 'electrical',
    content: `Car batteries typically last 3-5 years. Signs of failing battery:

- Slow engine cranking
- Clicking sound when turning key
- Dim headlights at idle
- Electrical accessories working weakly
- Battery warning light
- Swollen battery case
- Corrosion on terminals

Testing: Battery should read 12.6V when fully charged, 12.4V at 75% charge, 12.2V at 50% charge. Load test shows capacity under strain.

Common causes of failure: Age, extreme temperatures, short trips not allowing full recharge, leaving accessories on, charging system problems.

Replacement cost: $100-$250 installed. Premium batteries (AGM, longer warranty) cost more.

Maintenance: Clean terminals regularly, ensure tight connections, have battery tested annually after 3 years.

Pro tip: Battery failure often happens in extreme temperature (very hot or cold weather).`,
  },
  {
    title: 'Oxygen Sensor Failure - Fuel Economy Impact',
    category: 'emissions',
    content: `Oxygen (O2) sensors monitor exhaust gases to optimize fuel mixture. Failure symptoms:

- Check engine light (codes P0130-P0167)
- Decreased fuel economy (10-40% worse)
- Rough idle
- Engine hesitation or stumbling
- Failed emissions test

Location: Upstream O2 sensors before catalytic converter, downstream sensors after converter.

Common causes: Contamination from oil or coolant consumption, age (typically replaced every 60k-100k miles), using non-recommended fuel additives.

Diagnosis: Read diagnostic codes. Inspect sensor connector and wiring. Monitor O2 sensor data with scan tool.

Replacement cost: $150-$400 per sensor including labor. Parts: $80-$250, Labor: 0.5-1 hour.

Note: Upstream sensors fail more frequently. Some vehicles have 4 sensors (2 upstream, 2 downstream).

Impact: Failed O2 sensor can cause catalytic converter damage over time due to incorrect fuel mixture.`,
  },
  {
    title: 'Tire Pressure Monitoring System (TPMS)',
    category: 'wheels',
    content: `TPMS warns when tire pressure is low. Common issues:

Symptoms:
- TPMS warning light constant or flashing
- Inaccurate pressure readings
- Light comes on with temperature changes

Common causes:
- Actually low tire pressure (check first!)
- Dead TPMS sensor batteries (5-10 year life)
- Damaged sensors during tire change
- Sensors not relearned after tire rotation
- Faulty TPMS module

Diagnosis: Check actual tire pressures with gauge. Scan TPMS system for sensor IDs and battery status.

Repair costs:
- TPMS sensor replacement: $50-$100 per sensor
- TPMS relearn procedure: $25-$50
- Battery replacement (if available): $20-$40 per sensor

Maintenance: Check tire pressure monthly, have sensors checked during tire service, replace sensors when changing to new wheels.

Note: Proper tire pressure improves fuel economy, tire life, and safety.`,
  },
  {
    title: 'Catalytic Converter Failure and Theft Prevention',
    category: 'emissions',
    content: `Catalytic converters reduce harmful emissions. Issues include:

Failure symptoms:
- Check engine light (codes P0420, P0430)
- Rattling noise from underneath
- Reduced engine performance
- Smell of sulfur/rotten eggs
- Failed emissions test

Common causes: Internal catalyst breakdown, contamination from engine oil consumption, overheating, age, impact damage.

Diagnosis: Measure backpressure, inspect physically for damage, check O2 sensor readings before/after converter.

Replacement cost: $800-$2,500+ depending on vehicle. Parts: $500-$2,000+, Labor: 1-3 hours.

Theft prevention (high-theft vehicles like Prius, trucks):
- Install catalytic converter shield ($150-$400)
- Etch VIN on converter
- Park in well-lit areas or garage
- Install security cameras

Warning: Driving with failed converter is illegal and harms environment. Don't ignore check engine light.`,
  },
  {
    title: 'Power Steering Problems - Pump and Rack Issues',
    category: 'steering',
    content: `Power steering makes turning easy. Common problems:

Symptoms:
- Hard steering (especially at low speeds)
- Whining or groaning noise when turning
- Steering wheel slow to return to center
- Fluid leaking under vehicle
- Steering feels loose or vague

Common causes:
- Low power steering fluid
- Worn power steering pump
- Leaking rack and pinion
- Loose or worn drive belt
- Air in power steering system

Diagnosis: Check fluid level and condition. Listen for pump noise. Inspect for leaks at rack, hoses, pump. Check belt tension.

Repair costs:
- Power steering flush: $80-$150
- Drive belt: $100-$200
- Power steering pump: $300-$600
- Rack and pinion: $800-$1,500
- Hose replacement: $150-$400

Note: Many newer vehicles use electric power steering (no fluid) with different failure modes.`,
  },
  {
    title: 'Air Conditioning Not Cooling - AC System Diagnosis',
    category: 'hvac',
    content: `AC system cools cabin air. Common problems:

Symptoms:
- No cold air, only warm/hot air
- Weak airflow
- AC works intermittently
- Strange smells from vents
- Unusual noises when AC is on

Common causes:
- Low refrigerant from leak
- Failed AC compressor
- Clogged expansion valve or orifice tube
- Electrical issues (relay, fuse, pressure switch)
- Blocked condenser
- Cabin air filter clogged

Diagnosis: Check for leaks with UV dye. Measure system pressures. Test compressor clutch engagement. Check cabin air filter.

Repair costs:
- Refrigerant recharge: $150-$300
- AC compressor: $500-$1,200
- Condenser: $400-$900  
- Leak repair: $200-$600
- Cabin air filter: $20-$50 DIY, $50-$100 installed

Prevention: Run AC briefly even in winter to keep seals lubricated. Replace cabin filter regularly.`,
  },
  {
    title: 'Wheel Bearing Noise - Diagnosis and Replacement',
    category: 'wheels',
    content: `Wheel bearings allow wheels to rotate smoothly. Failure symptoms:

- Humming, growling, or grinding noise that changes with speed
- Noise louder when turning (loaded bearing makes more noise)
- Wheel wobble or play
- ABS warning light (if bearing has sensor)
- Uneven tire wear

Testing: Safely lift vehicle, grasp tire at 12 and 6 o'clock, push/pull to check for play. Spin wheel and listen for roughness.

Common causes: Normal wear (50k-100k+ miles), damaged seals allowing contamination, impact from potholes, improper installation.

Diagnosis: Test drive and identify which wheel (sound location). Jack up vehicle and test for play. Feel for roughness when spinning wheel.

Replacement cost: $200-$500 per wheel including labor. Parts: $80-$250, Labor: 1-2 hours.

Warning: Failed wheel bearings are safety hazards. Wheel can lock up or come off if bearing completely fails. Replace promptly when diagnosed.

Note: Some vehicles have hub assemblies (entire unit replaced), others have pressed bearings (more labor).`,
  },
  {
    title: 'Fuel Pump Failure - Diagnosis and Replacement',
    category: 'fuel',
    content: `Fuel pump delivers fuel from tank to engine. Failure symptoms:

- Engine cranks but won't start
- Engine starts then dies
- Sputtering at high speeds
- Loss of power under load
- Whining noise from fuel tank
- Check engine light with fuel system codes

Common causes: Contaminated fuel, running tank too low frequently (pump uses fuel for cooling), age, electrical issues, clogged fuel filter.

Diagnosis: Check fuel pressure with gauge (consult specs for vehicle). Listen for pump prime when key turned to ON. Scan for codes.

Replacement cost: $400-$900 including labor. Parts: $200-$500, Labor: 1-3 hours (some require dropping fuel tank).

Prevention: Keep fuel tank above 1/4, use quality fuel, replace fuel filter per schedule (if equipped with serviceable filter).

Emergency: Tapping fuel tank may temporarily get failing pump working to limp to repair shop.`,
  },
]

async function seedKnowledge() {
  console.log('Starting knowledge base seeding...')

  try {
    // Generate embeddings and insert knowledge
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })

    for (const item of repairKnowledge) {
      console.log(`Processing: ${item.title}`)

      // Generate embedding
      const embeddingResult = await model.embedContent(
        `${item.title}\n${item.content}`
      )
      const embedding = embeddingResult.embedding.values

      // Insert into database
      const { error } = await supabase.from('repair_knowledge').insert({
        title: item.title,
        category: item.category,
        content: item.content,
        embedding: embedding,
      })

      if (error) {
        console.error(`Error inserting ${item.title}:`, error)
      } else {
        console.log(`✓ Inserted: ${item.title}`)
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    console.log('\n✓ Knowledge base seeding completed!')
    console.log(`Total items: ${repairKnowledge.length}`)
  } catch (error) {
    console.error('Error seeding knowledge base:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedKnowledge()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedKnowledge }
