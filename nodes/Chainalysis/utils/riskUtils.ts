/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  RISK_SCORE_RANGES,
  RISK_LEVELS,
  type RiskLevel,
  getRiskLevelFromScore,
} from '../constants/riskLevels';
import { CATEGORY_RISK_LEVELS, type RiskCategory } from '../constants/categories';

/**
 * Risk assessment result interface
 */
export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  categories: RiskCategory[];
  triggers: string[];
  breakdown: {
    directExposure: number;
    indirectExposure: number;
    categoryRisk: number;
    behaviorRisk: number;
  };
}

/**
 * Calculate overall risk level from multiple factors
 */
export function calculateOverallRiskLevel(
  directRisk: number,
  indirectRisk: number,
  categoryRisk: number,
  behaviorRisk: number,
): RiskAssessment {
  // Weight factors for risk calculation
  const weights = {
    direct: 0.4,
    indirect: 0.25,
    category: 0.25,
    behavior: 0.1,
  };

  const weightedScore =
    directRisk * weights.direct +
    indirectRisk * weights.indirect +
    categoryRisk * weights.category +
    behaviorRisk * weights.behavior;

  // Normalize to 0-10 scale
  const normalizedScore = Math.min(10, Math.max(0, weightedScore));

  return {
    score: Math.round(normalizedScore * 100) / 100,
    level: getRiskLevelFromScore(normalizedScore),
    categories: [],
    triggers: [],
    breakdown: {
      directExposure: directRisk,
      indirectExposure: indirectRisk,
      categoryRisk,
      behaviorRisk,
    },
  };
}

/**
 * Get risk level for a category
 */
export function getCategoryRiskLevel(category: string): RiskLevel {
  const level = CATEGORY_RISK_LEVELS[category.toLowerCase()];
  return level || RISK_LEVELS.LOW;
}

/**
 * Check if risk exceeds threshold
 */
export function exceedsRiskThreshold(score: number, threshold: RiskLevel): boolean {
  const thresholdValues: Record<RiskLevel, number> = {
    [RISK_LEVELS.LOW]: RISK_SCORE_RANGES.LOW.max,
    [RISK_LEVELS.MEDIUM]: RISK_SCORE_RANGES.MEDIUM.max,
    [RISK_LEVELS.HIGH]: RISK_SCORE_RANGES.HIGH.max,
    [RISK_LEVELS.SEVERE]: RISK_SCORE_RANGES.SEVERE.max,
  };

  return score > thresholdValues[threshold];
}

/**
 * Format risk score for display
 */
export function formatRiskScore(score: number): string {
  return `${score.toFixed(2)}/10`;
}

/**
 * Get risk level color for UI
 */
export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    [RISK_LEVELS.LOW]: '#22c55e', // green
    [RISK_LEVELS.MEDIUM]: '#f59e0b', // amber
    [RISK_LEVELS.HIGH]: '#ef4444', // red
    [RISK_LEVELS.SEVERE]: '#7c2d12', // dark red
  };
  return colors[level];
}

/**
 * Aggregate multiple risk assessments
 */
export function aggregateRiskAssessments(assessments: RiskAssessment[]): RiskAssessment {
  if (assessments.length === 0) {
    return {
      score: 0,
      level: RISK_LEVELS.LOW,
      categories: [],
      triggers: [],
      breakdown: {
        directExposure: 0,
        indirectExposure: 0,
        categoryRisk: 0,
        behaviorRisk: 0,
      },
    };
  }

  // Take maximum values for conservative risk assessment
  const maxScore = Math.max(...assessments.map((a) => a.score));
  const allCategories = [...new Set(assessments.flatMap((a) => a.categories))];
  const allTriggers = [...new Set(assessments.flatMap((a) => a.triggers))];

  return {
    score: maxScore,
    level: getRiskLevelFromScore(maxScore),
    categories: allCategories,
    triggers: allTriggers,
    breakdown: {
      directExposure: Math.max(...assessments.map((a) => a.breakdown.directExposure)),
      indirectExposure: Math.max(...assessments.map((a) => a.breakdown.indirectExposure)),
      categoryRisk: Math.max(...assessments.map((a) => a.breakdown.categoryRisk)),
      behaviorRisk: Math.max(...assessments.map((a) => a.breakdown.behaviorRisk)),
    },
  };
}

/**
 * Check if risk assessment indicates sanctions exposure
 */
export function hasSanctionsExposure(assessment: RiskAssessment): boolean {
  return (
    assessment.categories.includes('sanctions' as RiskCategory) ||
    assessment.triggers.includes('sanctions_exposure')
  );
}
