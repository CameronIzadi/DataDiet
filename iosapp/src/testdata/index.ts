/**
 * Test Data Module
 *
 * Provides pre-generated test datasets for different usage scenarios.
 * Use these for development, testing, and demos.
 */

export {
  generateAmericanDiet20,
  generateAmericanDiet50,
  generateAmericanDiet80,
  generateAmericanDiet100,
  generateAmericanDiet,
  getDatasetSummary,
} from './americanDiet';

// Re-export types for convenience
export type { Meal, FoodItem, Nutrition } from '../types';
