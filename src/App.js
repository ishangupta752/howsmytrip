import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('alcohol');
  const [showResults, setShowResults] = useState(false);
  const [showStrainChart, setShowStrainChart] = useState(false);
  const [thcInputMethod, setThcInputMethod] = useState('strain');

  // Strain database
  const strainDatabase = [
    { name: 'OG Kush', thc: '24', type: 'Hybrid', effects: 'Relaxed, Happy, Hungry' },
    { name: 'Blue Dream', thc: '20', type: 'Sativa', effects: 'Creative, Uplifted, Energetic' },
    { name: 'Granddaddy Purple', thc: '20', type: 'Indica', effects: 'Sleepy, Relaxed, Happy' },
    { name: 'Purple Haze', thc: '22', type: 'Sativa', effects: 'Energetic, Creative, Uplifted' },
    { name: 'Sour Diesel', thc: '23', type: 'Sativa', effects: 'Energetic, Focused, Talkative' },
    { name: 'Northern Lights', thc: '19', type: 'Indica', effects: 'Relaxed, Sleepy, Euphoric' },
    { name: 'Girl Scout Cookies', thc: '22', type: 'Hybrid', effects: 'Euphoric, Creative, Relaxed' },
    { name: 'Pineapple Express', thc: '20', type: 'Hybrid', effects: 'Happy, Uplifted, Creative' },
    { name: 'Bruce Banner', thc: '26', type: 'Hybrid', effects: 'Euphoric, Energetic, Focused' },
    { name: 'White Widow', thc: '20', type: 'Hybrid', effects: 'Creative, Euphoric, Relaxed' },
    { name: 'AK-47', thc: '21', type: 'Hybrid', effects: 'Happy, Euphoric, Uplifted' }
  ];

  // Drink info - cocktail clearly shows 30ml pure alcohol
  const drinkInfo = {
    beer: { name: 'Beer 🍺', ml: 355, abv: '5%', grams: 14 },
    wine: { name: 'Wine 🍷', ml: 148, abv: '12%', grams: 14 },
    shot: { name: 'Shot 🥃', ml: 44, abv: '40%', grams: 14 },
    cocktail: { name: 'Cocktail 🍸 (30ml pure alcohol per drink)', ml: 250, abv: '~15%', grams: 24 }
  };

  // Form state
  const [formData, setFormData] = useState({
    alcohol: {
      weight: '',
      sex: '',
      age: '',
      bodyFat: '',
      beers: '',
      wines: '',
      shots: '',
      cocktails: '',
      hoursDrinking: '',
      hoursSince: '',
      food: 'medium',
      hydration: 'average',
      yearsDrinking: '1-5',
      typicalDrinks: '3-4',
      bingeFrequency: 'monthly',
      recency: 'today',
      breakHistory: 'none'
    },
    cannabis: {
      weight: '',
      sex: '',
      age: '',
      bodyFat: '',
      jointSize: '',
      yourPuffs: '',
      minutesSince: '',
      thcPercent: '20',
      selectedStrain: '',
      frequency: 'occasional',
      yearsUsing: '1-5',
      sessionLength: '30',
      hoursSinceMeal: '2'
    }
  });

  const handleStrainSelect = (strainName) => {
    const strain = strainDatabase.find(s => s.name === strainName);
    if (strain) {
      setFormData(prev => ({
        ...prev,
        cannabis: { ...prev.cannabis, selectedStrain: strainName, thcPercent: strain.thc }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        cannabis: { ...prev.cannabis, selectedStrain: strainName }
      }));
    }
    setShowResults(false);
  };

  const handleInputChange = (tab, field, value) => {
    setFormData(prev => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value }
    }));
    setShowResults(false);
  };

  const handleReset = () => {
    setFormData({
      alcohol: { weight: '', sex: '', age: '', bodyFat: '', beers: '', wines: '', shots: '', cocktails: '', hoursDrinking: '', hoursSince: '', food: 'medium', hydration: 'average', yearsDrinking: '1-5', typicalDrinks: '3-4', bingeFrequency: 'monthly', recency: 'today', breakHistory: 'none' },
      cannabis: { weight: '', sex: '', age: '', bodyFat: '', jointSize: '', yourPuffs: '', minutesSince: '', thcPercent: '20', selectedStrain: '', frequency: 'occasional', yearsUsing: '1-5', sessionLength: '30', hoursSinceMeal: '2' }
    });
    setShowResults(false);
    setThcInputMethod('strain');
  };

  // ========== ALCOHOL CALCULATIONS ==========
  const calculateTotalGrams = () => {
    const data = formData.alcohol;
    const beers = (parseFloat(data.beers) || 0) * 14;
    const wines = (parseFloat(data.wines) || 0) * 14;
    const shots = (parseFloat(data.shots) || 0) * 14;
    const cocktails = (parseFloat(data.cocktails) || 0) * 24;
    return beers + wines + shots + cocktails;
  };

  const calculateBAC = () => {
    const data = formData.alcohol;
    if (!data.weight || !data.sex || !data.hoursDrinking || !data.hoursSince) return null;
    if (!data.beers && !data.wines && !data.shots && !data.cocktails) return null;

    const totalGrams = calculateTotalGrams();
    const r = data.sex === 'male' ? 0.68 : (data.sex === 'female' ? 0.55 : 0.615);
    const weightGrams = parseFloat(data.weight) * 1000;
    
    let adjustedR = r;
    if (data.bodyFat && parseFloat(data.bodyFat) > 0) {
      const bodyFat = parseFloat(data.bodyFat);
      adjustedR = r - ((bodyFat - 15) / 100) * 0.15;
      adjustedR = Math.max(0.45, Math.min(0.75, adjustedR));
    }
    
    const foodFactor = { 'empty': 1.2, 'light': 1.0, 'medium': 0.85, 'heavy': 0.7 }[data.food] || 1.0;
    const hydrationFactor = { 'low': 1.1, 'average': 1.0, 'high': 0.95 }[data.hydration] || 1.0;
    
    let bac = (totalGrams / (weightGrams * adjustedR)) * 100;
    bac *= foodFactor * hydrationFactor;
    bac -= 0.015 * (parseFloat(data.hoursDrinking) + parseFloat(data.hoursSince));
    return Math.max(0, bac);
  };

  const calculateAlcoholTolerance = () => {
    const data = formData.alcohol;
    const yearsScore = { '<1': 1, '1-5': 2, '5-10': 3, '10+': 4 }[data.yearsDrinking] || 2;
    const typicalScore = { '1-2': 1, '3-4': 2, '5-7': 3, '8+': 4 }[data.typicalDrinks] || 2;
    const bingeScore = { 'never': 1, 'monthly': 2, 'weekly': 3, 'multiple': 4 }[data.bingeFrequency] || 2;
    const recencyScore = { 'today': 4, '1-3d': 3, '4-7d': 2, '1-4w': 1, '1m+': 0 }[data.recency] || 2;
    const breakBonus = { 'none': 0, '1-4w': 0.5, '1-3m': 1, '3m+': 1.5 }[data.breakHistory] || 0;
    const sumScores = yearsScore + typicalScore + bingeScore + recencyScore;
    return (sumScores / 4) + breakBonus;
  };

  const bac = calculateBAC();
  const alcoholTolerance = calculateAlcoholTolerance();
  const alcoholEffect = bac ? Math.min(100, Math.round((bac * 500) / alcoholTolerance)) : 0;
  const timeToSober = bac ? (bac / 0.015).toFixed(1) : '0';

  const getAlcoholLevel = (score) => {
    if (score <= 15) return { level: '💧 Sober', desc: 'Completely normal. No effects.', color: '#2DD4BF' };
    if (score <= 30) return { level: '🌿 Mild', desc: 'Relaxed, slightly talkative.', color: '#84CC16' };
    if (score <= 45) return { level: '🍃 Buzzed', desc: 'Clearly feeling it. Talkative.', color: '#FBBF24' };
    if (score <= 60) return { level: '🔥 Tipsy', desc: 'Euphoric, louder. Coordination loss.', color: '#FF8C42' };
    if (score <= 75) return { level: '🌊 Drunk', desc: 'Very slurred, clumsy. Blackout risk.', color: '#EF4444' };
    return { level: '⚠️ Severe', desc: 'Severe impairment. Medical risk.', color: '#F43F5E' };
  };

  // ========== CANNABIS CALCULATIONS ==========
  const calculateCannabisDose = () => {
    const data = formData.cannabis;
    if (!data.jointSize || !data.yourPuffs) return 0;
    const totalPuffs = 30;
    const yourShare = parseFloat(data.yourPuffs) / totalPuffs;
    const yourGrams = parseFloat(data.jointSize) * yourShare;
    const thcPercent = parseFloat(data.thcPercent) || 20;
    return yourGrams * 1000 * (thcPercent / 100);
  };

  const calculateCannabisTolerance = () => {
    const data = formData.cannabis;
    const freqScore = { 'never': 0.4, 'rarely': 0.7, 'occasional': 1.0, 'regular': 1.5, 'daily': 2.0, 'heavy': 2.5 }[data.frequency] || 1.0;
    const yearsScore = { '<1': 0.8, '1-5': 1.0, '5-10': 1.2, '10+': 1.3 }[data.yearsUsing] || 1.0;
    return (freqScore + yearsScore) / 2;
  };

  const calculateCannabisEffectScore = () => {
    const data = formData.cannabis;
    const doseMg = calculateCannabisDose();
    if (doseMg === 0) return 0;
    
    const weight = parseFloat(data.weight) || 70;
    const bioavailability = 0.56;
    const vdLiters = weight * 10;
    
    const thcAbsorbedMcg = doseMg * bioavailability * 1000;
    const peakNgMl = thcAbsorbedMcg / vdLiters;
    const tolerance = calculateCannabisTolerance();
    
    const EC50 = 35 * tolerance;
    let effect = (100 * peakNgMl) / (EC50 + peakNgMl);
    
    const sessionMins = parseFloat(data.sessionLength) || 30;
    const sessionFactor = Math.min(1.2, Math.max(0.8, sessionMins / 30));
    effect *= sessionFactor;
    
    return Math.min(100, Math.max(0, Math.round(effect)));
  };

  const thcMg = calculateCannabisDose();
  const cannabisEffect = calculateCannabisEffectScore();

  const getCannabisLevel = (score) => {
    if (score <= 5) return { level: '💨 Sub-perceptual', desc: 'Barely noticeable.', color: '#6B7280' };
    if (score <= 15) return { level: '🌱 Micro-dose', desc: 'Subtle mood lift.', color: '#2DD4BF' };
    if (score <= 30) return { level: '🌿 Mild', desc: 'Noticeable but controllable.', color: '#84CC16' };
    if (score <= 45) return { level: '🍃 Moderate', desc: 'Clearly high, creative.', color: '#FBBF24' };
    if (score <= 60) return { level: '🔥 Active', desc: 'Strong effects, time distortion.', color: '#FF8C42' };
    if (score <= 75) return { level: '⚡ Potent', desc: 'Very altered, couch-lock.', color: '#EF4444' };
    if (score <= 90) return { level: '🌋 Intense', desc: 'Overwhelming. Panic, nausea.', color: '#F43F5E' };
    return { level: '🌀 Severe Toxicity', desc: 'Medical help may be needed.', color: '#BE123C' };
  };

  const alcoholLevel = getAlcoholLevel(alcoholEffect);
  const cannabisLevel = getCannabisLevel(cannabisEffect);

  const EffectChart = ({ type }) => {
    const alcoholChart = [
      { min: 0, max: 15, level: '💧 Sober', desc: 'Completely normal. No effects. Safe to drive.' },
      { min: 16, max: 30, level: '🌿 Mild', desc: 'Relaxed, slightly talkative. Minor effects.' },
      { min: 31, max: 45, level: '🍃 Buzzed', desc: 'Clearly feeling it. Talkative, confident.' },
      { min: 46, max: 60, level: '🔥 Tipsy', desc: 'Euphoric, louder. Coordination loss.' },
      { min: 61, max: 75, level: '🌊 Drunk', desc: 'Very slurred, clumsy. Blackout risk.' },
      { min: 76, max: 100, level: '⚠️ Severe', desc: 'Severe impairment. Medical risk.' }
    ];
    const cannabisChart = [
      { min: 0, max: 5, level: '💨 Sub-perceptual', desc: 'Barely noticeable. Fully functional.' },
      { min: 6, max: 15, level: '🌱 Micro-dose', desc: 'Subtle mood lift. No impairment.' },
      { min: 16, max: 30, level: '🌿 Mild', desc: 'Noticeable but controllable. Slight euphoria.' },
      { min: 31, max: 45, level: '🍃 Moderate', desc: 'Clearly high, creative. DO NOT DRIVE.' },
      { min: 46, max: 60, level: '🔥 Active', desc: 'Strong effects, time distortion.' },
      { min: 61, max: 75, level: '⚡ Potent', desc: 'Very altered, couch-lock.' },
      { min: 76, max: 90, level: '🌋 Intense', desc: 'Overwhelming. Panic, nausea.' },
      { min: 91, max: 100, level: '🌀 Severe Toxicity', desc: 'Medical help may be needed.' }
    ];
    const chart = type === 'alcohol' ? alcoholChart : cannabisChart;
    return (
      <div style={{ marginTop: '24px', background: '#1E2532', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#8A99B4', marginBottom: '12px' }}>📋 EFFECT SCALE — WHAT EACH SCORE MEANS</div>
        {chart.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '12px', padding: '8px 0', borderBottom: i < chart.length - 1 ? '1px solid #2A3441' : 'none' }}>
            <span style={{ width: '50px', color: '#8A99B4' }}>{item.min}-{item.max}</span>
            <span style={{ width: '100px', fontWeight: '600' }}>{item.level}</span>
            <span style={{ flex: 1, color: '#8A99B4' }}>{item.desc}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px', fontFamily: "'Inter', sans-serif", background: '#0A0D14', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        input, select { font-family: 'Inter', sans-serif; }
      `}</style>

      <div style={{ background: '#1E2532', borderRadius: '12px', padding: '12px 20px', marginBottom: '24px', borderLeft: '4px solid #FF8C42' }}>
        <p style={{ fontSize: '13px', color: '#8A99B4', textAlign: 'center' }}>
          ⚠️ <strong>EDUCATIONAL PURPOSES ONLY</strong> — This tool provides estimates. Results are <strong>NOT 100% accurate</strong>. Never drive if you feel impaired.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #1E2532' }}>
        <div style={{ fontSize: '24px', fontWeight: '700' }}>
          <span style={{ color: '#FF8C42' }}>howsmy</span><span style={{ color: '#2DD4BF' }}>trip</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => { setActiveTab('alcohol'); setShowResults(false); }} style={{ padding: '10px 24px', borderRadius: '100px', fontWeight: '500', background: activeTab === 'alcohol' ? '#FF8C42' : 'transparent', color: activeTab === 'alcohol' ? '#0A0D14' : '#8A99B4', border: activeTab === 'alcohol' ? 'none' : '1px solid #1E2532', cursor: 'pointer' }}>🍺 Alcohol</button>
          <button onClick={() => { setActiveTab('cannabis'); setShowResults(false); }} style={{ padding: '10px 24px', borderRadius: '100px', fontWeight: '500', background: activeTab === 'cannabis' ? '#2DD4BF' : 'transparent', color: activeTab === 'cannabis' ? '#0A0D14' : '#8A99B4', border: activeTab === 'cannabis' ? 'none' : '1px solid #1E2532', cursor: 'pointer' }}>🌿 Cannabis</button>
          <button onClick={handleReset} style={{ padding: '10px 16px', borderRadius: '12px', background: '#1E2532', border: 'none', color: '#8A99B4', cursor: 'pointer' }}>⟳ Reset</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
        <div style={{ background: '#11161F', borderRadius: '20px', padding: '24px', border: '1px solid #1E2532', position: 'sticky', top: '24px' }}>
          {activeTab === 'alcohol' ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', fontWeight: '700', color: alcoholLevel.color }}>{alcoholEffect}</div>
                <div style={{ fontSize: '12px', color: '#8A99B4', marginTop: '4px' }}>EFFECT SCORE</div>
                <div style={{ fontSize: '14px', fontWeight: '500', marginTop: '8px', color: alcoholLevel.color }}>{alcoholLevel.level}</div>
              </div>
              <div style={{ background: '#1E2532', borderRadius: '100px', height: '8px', marginBottom: '24px', overflow: 'hidden' }}><div style={{ width: `${alcoholEffect}%`, height: '100%', background: alcoholLevel.color, borderRadius: '100px' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1E2532' }}><span style={{ color: '#8A99B4' }}>BAC</span><span style={{ fontWeight: '600' }}>{bac ? bac.toFixed(3) : '0.000'}%</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}><span style={{ color: '#8A99B4' }}>Sober in</span><span style={{ fontWeight: '600' }}>{timeToSober} hours</span></div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', fontWeight: '700', color: cannabisLevel.color }}>{cannabisEffect}</div>
                <div style={{ fontSize: '12px', color: '#8A99B4', marginTop: '4px' }}>EFFECT SCORE</div>
                <div style={{ fontSize: '14px', fontWeight: '500', marginTop: '8px', color: cannabisLevel.color }}>{cannabisLevel.level}</div>
              </div>
              <div style={{ background: '#1E2532', borderRadius: '100px', height: '8px', marginBottom: '24px', overflow: 'hidden' }}><div style={{ width: `${cannabisEffect}%`, height: '100%', background: cannabisLevel.color, borderRadius: '100px' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1E2532' }}><span style={{ color: '#8A99B4' }}>THC Dose</span><span style={{ fontWeight: '600' }}>{thcMg.toFixed(0)} mg</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}><span style={{ color: '#8A99B4' }}>Minutes since</span><span style={{ fontWeight: '600' }}>{formData.cannabis.minutesSince || '0'} min</span></div>
            </>
          )}
        </div>

        <div style={{ background: '#11161F', borderRadius: '20px', padding: '28px', border: '1px solid #1E2532' }}>
          {activeTab === 'alcohol' ? (
            <>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#8A99B4', marginBottom: '16px' }}>📋 ABOUT YOU</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Weight (kg) *</label><input type="number" value={formData.alcohol.weight} onChange={(e) => handleInputChange('alcohol', 'weight', e.target.value)} placeholder="e.g., 70" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Sex *</label><select value={formData.alcohol.sex} onChange={(e) => handleInputChange('alcohol', 'sex', e.target.value)} style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Age (optional)</label><input type="number" value={formData.alcohol.age} onChange={(e) => handleInputChange('alcohol', 'age', e.target.value)} placeholder="e.g., 28" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Body fat % (optional)</label><input type="number" step="0.1" value={formData.alcohol.bodyFat} onChange={(e) => handleInputChange('alcohol', 'bodyFat', e.target.value)} placeholder="e.g., 20" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#8A99B4', marginBottom: '16px' }}>🍺 CURRENT SESSION</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Beers (355ml, 5%)</label><input type="number" value={formData.alcohol.beers} onChange={(e) => handleInputChange('alcohol', 'beers', e.target.value)} placeholder="0" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Wines (148ml, 12%)</label><input type="number" value={formData.alcohol.wines} onChange={(e) => handleInputChange('alcohol', 'wines', e.target.value)} placeholder="0" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Shots (44ml, 40%)</label><input type="number" value={formData.alcohol.shots} onChange={(e) => handleInputChange('alcohol', 'shots', e.target.value)} placeholder="0" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Cocktails (30ml pure alcohol each)</label><input type="number" value={formData.alcohol.cocktails} onChange={(e) => handleInputChange('alcohol', 'cocktails', e.target.value)} placeholder="0" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Hours drinking *</label><input type="number" step="0.5" value={formData.alcohol.hoursDrinking} onChange={(e) => handleInputChange('alcohol', 'hoursDrinking', e.target.value)} placeholder="e.g., 2" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Hours since last *</label><input type="number" step="0.5" value={formData.alcohol.hoursSince} onChange={(e) => handleInputChange('alcohol', 'hoursSince', e.target.value)} placeholder="e.g., 1" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Food</label><select value={formData.alcohol.food} onChange={(e) => handleInputChange('alcohol', 'food', e.target.value)} style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }}><option value="empty">Empty stomach</option><option value="light">Light snack</option><option value="medium">Medium meal</option><option value="heavy">Heavy meal</option></select></div>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Hydration</label><select value={formData.alcohol.hydration} onChange={(e) => handleInputChange('alcohol', 'hydration', e.target.value)} style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }}><option value="low">Low</option><option value="average">Average</option><option value="high">High</option></select></div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#8A99B4', marginBottom: '16px' }}>📊 YOUR DRINKING HISTORY</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Years drinking</label><select value={formData.alcohol.yearsDrinking} onChange={(e) => handleInputChange('alcohol', 'yearsDrinking', e.target.value)} style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }}><option value="<1">&lt;1 year</option><option value="1-5">1-5 years</option><option value="5-10">5-10 years</option><option value="10+">10+ years</option></select></div>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Typical drinks/session</label><select value={formData.alcohol.typicalDrinks} onChange={(e) => handleInputChange('alcohol', 'typicalDrinks', e.target.value)} style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }}><option value="1-2">1-2 drinks</option><option value="3-4">3-4 drinks</option><option value="5-7">5-7 drinks</option><option value="8+">8+ drinks</option></select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Binge frequency</label><select value={formData.alcohol.bingeFrequency} onChange={(e) => handleInputChange('alcohol', 'bingeFrequency', e.target.value)} style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }}><option value="never">Never</option><option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="multiple">Multiple/week</option></select></div>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Last drink before today</label><select value={formData.alcohol.recency} onChange={(e) => handleInputChange('alcohol', 'recency', e.target.value)} style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }}><option value="today">Today</option><option value="1-3d">1-3 days ago</option><option value="4-7d">4-7 days ago</option><option value="1-4w">1-4 weeks ago</option><option value="1m+">1+ months ago</option></select></div>
                </div>
                <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Recent tolerance break?</label><select value={formData.alcohol.breakHistory} onChange={(e) => handleInputChange('alcohol', 'breakHistory', e.target.value)} style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }}><option value="none">No break</option><option value="1-4w">1-4 weeks ago</option><option value="1-3m">1-3 months ago</option><option value="3m+">3+ months ago</option></select></div>
              </div>

              <button onClick={() => setShowResults(true)} style={{ width: '100%', padding: '16px', borderRadius: '16px', fontWeight: '600', fontSize: '16px', background: '#FF8C42', color: '#0A0D14', border: 'none', cursor: 'pointer' }}>CALCULATE IMPAIRMENT</button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#8A99B4', marginBottom: '16px' }}>📋 ABOUT YOU</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Weight (kg) *</label><input type="number" value={formData.cannabis.weight} onChange={(e) => handleInputChange('cannabis', 'weight', e.target.value)} placeholder="e.g., 70" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Sex *</label><select value={formData.cannabis.sex} onChange={(e) => handleInputChange('cannabis', 'sex', e.target.value)} style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Age (optional)</label><input type="number" value={formData.cannabis.age} onChange={(e) => handleInputChange('cannabis', 'age', e.target.value)} placeholder="e.g., 28" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Body fat % (optional)</label><input type="number" step="0.1" value={formData.cannabis.bodyFat} onChange={(e) => handleInputChange('cannabis', 'bodyFat', e.target.value)} placeholder="e.g., 20" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#8A99B4', marginBottom: '16px' }}>🌿 CURRENT SESSION</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Joint size (grams)</label><input type="number" step="0.1" value={formData.cannabis.jointSize} onChange={(e) => handleInputChange('cannabis', 'jointSize', e.target.value)} placeholder="e.g., 1.0" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /><div style={{ fontSize: '10px', color: '#8A99B4', marginTop: '4px' }}>~30 puffs per joint</div></div>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Your puffs taken</label><input type="number" value={formData.cannabis.yourPuffs} onChange={(e) => handleInputChange('cannabis', 'yourPuffs', e.target.value)} placeholder="e.g., 5" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Minutes since last dose</label><input type="number" value={formData.cannabis.minutesSince} onChange={(e) => handleInputChange('cannabis', 'minutesSince', e.target.value)} placeholder="e.g., 30" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Session length (min)</label><input type="number" value={formData.cannabis.sessionLength} onChange={(e) => handleInputChange('cannabis', 'sessionLength', e.target.value)} placeholder="30" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
                </div>
                <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Hours since last meal</label><input type="number" step="0.5" value={formData.cannabis.hoursSinceMeal} onChange={(e) => handleInputChange('cannabis', 'hoursSinceMeal', e.target.value)} placeholder="e.g., 2" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} /></div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#8A99B4', marginBottom: '16px' }}>🌱 THC / STRAIN INFO</div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <button onClick={() => setThcInputMethod('strain')} style={{ flex: 1, padding: '10px', borderRadius: '12px', fontWeight: '500', background: thcInputMethod === 'strain' ? '#2DD4BF' : '#1E2532', color: thcInputMethod === 'strain' ? '#0A0D14' : '#8A99B4', border: 'none', cursor: 'pointer' }}>Select Strain</button>
                  <button onClick={() => setThcInputMethod('manual')} style={{ flex: 1, padding: '10px', borderRadius: '12px', fontWeight: '500', background: thcInputMethod === 'manual' ? '#2DD4BF' : '#1E2532', color: thcInputMethod === 'manual' ? '#0A0D14' : '#8A99B4', border: 'none', cursor: 'pointer' }}>Enter THC %</button>
                </div>
                
                {thcInputMethod === 'strain' ? (
                  <>
                    <select value={formData.cannabis.selectedStrain} onChange={(e) => handleStrainSelect(e.target.value)} style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7', marginBottom: '12px' }}>
                      <option value="">Select a strain...</option>
                      {strainDatabase.map((strain, i) => (
                        <option key={i} value={strain.name}>{strain.name} ({strain.thc}% THC) - {strain.type}</option>
                      ))}
                    </select>
                    {formData.cannabis.selectedStrain && (
                      <div style={{ fontSize: '12px', color: '#2DD4BF', marginTop: '8px' }}>
                        THC: {strainDatabase.find(s => s.name === formData.cannabis.selectedStrain)?.thc}%
                      </div>
                    )}
                    <button onClick={() => setShowStrainChart(!showStrainChart)} style={{ marginTop: '12px', fontSize: '12px', color: '#2DD4BF', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      📊 {showStrainChart ? 'Hide' : 'Show'} full strain chart
                    </button>
                  </>
                ) : (
                  <input type="number" step="0.1" value={formData.cannabis.thcPercent} onChange={(e) => handleInputChange('cannabis', 'thcPercent', e.target.value)} placeholder="e.g., 20" style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }} />
                )}

                {showStrainChart && (
                  <div style={{ marginTop: '16px', background: '#1E2532', borderRadius: '16px', padding: '16px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr><th style={{ textAlign: 'left', padding: '8px', color: '#8A99B4' }}>Strain</th><th style={{ textAlign: 'left', padding: '8px', color: '#8A99B4' }}>THC %</th><th style={{ textAlign: 'left', padding: '8px', color: '#8A99B4' }}>Type</th><th style={{ textAlign: 'left', padding: '8px', color: '#8A99B4' }}>Effects</th></tr>
                      </thead>
                      <tbody>
                        {strainDatabase.map((strain, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #2A3441' }}>
                            <td style={{ padding: '8px', color: '#EDF2F7' }}>{strain.name}</td>
                            <td style={{ padding: '8px', color: '#2DD4BF' }}>{strain.thc}%</td>
                            <td style={{ padding: '8px', color: '#8A99B4' }}>{strain.type}</td>
                            <td style={{ padding: '8px', color: '#8A99B4' }}>{strain.effects}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p style={{ fontSize: '10px', color: '#8A99B4', marginTop: '12px', textAlign: 'center' }}>* THC varies by grower and batch</p>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#8A99B4', marginBottom: '16px' }}>📊 YOUR USAGE HISTORY</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Frequency</label><select value={formData.cannabis.frequency} onChange={(e) => handleInputChange('cannabis', 'frequency', e.target.value)} style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }}><option value="never">Never / First time</option><option value="rarely">Rarely (few times/year)</option><option value="occasional">Occasional (few times/month)</option><option value="regular">Regular (weekly)</option><option value="daily">Daily</option><option value="heavy">Heavy daily</option></select></div>
                  <div><label style={{ fontSize: '13px', color: '#8A99B4', marginBottom: '8px', display: 'block' }}>Years using</label><select value={formData.cannabis.yearsUsing} onChange={(e) => handleInputChange('cannabis', 'yearsUsing', e.target.value)} style={{ width: '100%', padding: '12px', background: '#1E2532', border: 'none', borderRadius: '12px', color: '#EDF2F7' }}><option value="<1">&lt;1 year</option><option value="1-5">1-5 years</option><option value="5-10">5-10 years</option><option value="10+">10+ years</option></select></div>
                </div>
              </div>

              <button onClick={() => setShowResults(true)} style={{ width: '100%', padding: '16px', borderRadius: '16px', fontWeight: '600', fontSize: '16px', background: '#2DD4BF', color: '#0A0D14', border: 'none', cursor: 'pointer' }}>CALCULATE EFFECTS</button>
            </>
          )}
        </div>
      </div>

      {showResults && (
        <div style={{ marginTop: '32px', background: '#11161F', borderRadius: '20px', padding: '28px', border: '1px solid #1E2532' }}>
          {activeTab === 'alcohol' && bac !== null ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div><span style={{ color: '#8A99B4', fontSize: '13px' }}>EFFECT SCORE</span><div style={{ fontSize: '36px', fontWeight: '700', color: alcoholLevel.color }}>{alcoholEffect} — {alcoholLevel.level}</div></div>
                <div><span style={{ color: '#8A99B4', fontSize: '13px' }}>BAC</span><div style={{ fontSize: '28px', fontWeight: '700' }}>{bac.toFixed(3)}%</div></div>
                <div><span style={{ color: '#8A99B4', fontSize: '13px' }}>Time to sober</span><div style={{ fontSize: '28px', fontWeight: '700' }}>{timeToSober} hours</div></div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, rgba(255,140,66,0.1), rgba(45,212,191,0.05))', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid rgba(255,140,66,0.2)' }}>
                <div style={{ fontWeight: '600', marginBottom: '12px' }}>⚠️ THE TOLERANCE TRAP</div>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '16px' }}>
                  <div><div style={{ fontSize: '12px', color: '#8A99B4' }}>You FEEL</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#2DD4BF' }}>{Math.round(alcoholEffect * 0.4)}</div></div>
                  <div><div style={{ fontSize: '12px', color: '#8A99B4' }}>You ARE</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#FF8C42' }}>{alcoholEffect}</div></div>
                  <div><div style={{ fontSize: '12px', color: '#8A99B4' }}>Others see</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#FBBF24' }}>{Math.round(alcoholEffect * 0.6)}</div></div>
                </div>
                <div style={{ fontSize: '13px', textAlign: 'center', color: '#FF8C42' }}>You feel less drunk than you actually are. DO NOT DRIVE.</div>
              </div>
              <EffectChart type="alcohol" />
              <div style={{ marginTop: '24px', background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid #EF4444', padding: '16px', borderRadius: '12px' }}><strong style={{ display: 'block', marginBottom: '8px' }}>🚫 DO NOT DRIVE</strong>Wait at least {timeToSober} hours before driving. Your tolerance is {alcoholTolerance.toFixed(1)}× average — you feel less impaired than you are.</div>
            </>
          ) : activeTab === 'cannabis' && thcMg > 0 ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div><span style={{ color: '#8A99B4', fontSize: '13px' }}>EFFECT SCORE</span><div style={{ fontSize: '36px', fontWeight: '700', color: cannabisLevel.color }}>{cannabisEffect} — {cannabisLevel.level}</div></div>
                <div><span style={{ color: '#8A99B4', fontSize: '13px' }}>THC Dose</span><div style={{ fontSize: '28px', fontWeight: '700' }}>{thcMg.toFixed(0)} mg</div></div>
                <div><span style={{ color: '#8A99B4', fontSize: '13px' }}>Minutes since</span><div style={{ fontSize: '28px', fontWeight: '700' }}>{formData.cannabis.minutesSince || '0'} min</div></div>
              </div>
              <EffectChart type="cannabis" />
              <div style={{ marginTop: '24px', background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid #EF4444', padding: '16px', borderRadius: '12px' }}><strong style={{ display: 'block', marginBottom: '8px' }}>⚠️ SAFETY FIRST</strong>Find a comfortable space. Stay hydrated. Effects will pass in 2-3 hours. DO NOT DRIVE.</div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#8A99B4', padding: '40px' }}>Please fill in all required fields above.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
