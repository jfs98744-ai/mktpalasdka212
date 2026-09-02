import { Property, ClientRequest } from '../types';

export interface MatchResult {
  property: Property;
  score: number; // 0 to 100
  matchedReasons: string[];
  mismatchedReasons: string[];
}

export function findMatchingProperties(request: ClientRequest, properties: Property[]): MatchResult[] {
  // Only match available or reserved properties
  const candidateProperties = properties.filter(p => p.status === 'available' || p.status === 'reserved');

  const results: MatchResult[] = [];

  for (const property of candidateProperties) {
    let score = 0;
    const matchedReasons: string[] = [];
    const mismatchedReasons: string[] = [];

    // 1. Deal Type (Sale / Rent) - Critical (Weight: 30%)
    if (property.dealType === request.dealType) {
      score += 30;
      matchedReasons.push(request.dealType === 'sale' ? 'نوع المعاملة: بيع (مطابق)' : 'نوع المعاملة: إيجار (مطابق)');
    } else {
      mismatchedReasons.push(`نوع المعاملة غير متطابق (${property.dealType === 'sale' ? 'معروض للبيع' : 'معروض للإيجار'})`);
      continue; // Hard skip if deal type differs
    }

    // 2. Property Type (Weight: 25%)
    if (request.propertyType === 'all' || property.type === request.propertyType) {
      score += 25;
      matchedReasons.push('نوع العقار مطابق للطلب');
    } else {
      mismatchedReasons.push('نوع العقار يختلف عن المطلوب');
      score -= 10;
    }

    // 3. Location / District (Weight: 20%)
    const districtMatch = request.preferredDistricts.some(d =>
      property.district.toLowerCase().includes(d.toLowerCase()) ||
      d.toLowerCase().includes(property.district.toLowerCase())
    );

    if (request.preferredDistricts.length === 0 || districtMatch) {
      score += 20;
      matchedReasons.push(`المنطقة (${property.district}) ضمن المناطق المطلوبة`);
    } else {
      mismatchedReasons.push(`العقار في منطقة (${property.district}) وليس في رغبات العميل`);
    }

    // 4. Area boundaries (Weight: 15%)
    const minArea = request.minArea || 0;
    const maxArea = request.maxArea || 999999;
    if (property.area >= minArea && property.area <= maxArea) {
      score += 15;
      matchedReasons.push(`المساحة (${property.area} م²) ضمن النطاق المطلوب`);
    } else if (property.area >= minArea * 0.85 && property.area <= maxArea * 1.15) {
      score += 8;
      matchedReasons.push(`المساحة (${property.area} م²) قريبة جداً من النطاق المطلوب`);
    } else {
      mismatchedReasons.push(`المساحة (${property.area} م²) خارج النطاق المطلوب`);
    }

    // 5. Budget (Weight: 10%)
    const minBudget = request.minBudget || 0;
    const maxBudget = request.maxBudget || Infinity;
    // Assuming same currency or proportional check
    if (property.currency === request.currency) {
      if (property.price >= minBudget && property.price <= maxBudget) {
        score += 10;
        matchedReasons.push(`السعر مناسب لميزانية العميل (${property.price.toLocaleString()} ${property.currency})`);
      } else if (property.price <= maxBudget * 1.1) {
        score += 5;
        matchedReasons.push(`السعر أعلى بقليل (فارق تفاوضي بسيط)`);
      } else {
        mismatchedReasons.push(`السعر خارج حدود الميزانية`);
      }
    } else {
      score += 5; // currency undetermined
    }

    const finalScore = Math.min(Math.max(score, 0), 100);

    if (finalScore >= 50) {
      results.push({
        property,
        score: finalScore,
        matchedReasons,
        mismatchedReasons,
      });
    }
  }

  // Sort descending by score
  return results.sort((a, b) => b.score - a.score);
}
