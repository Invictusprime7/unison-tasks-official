/**
 * Contracts Module — Canonical business operating contracts
 * 
 * Pipeline:
 *   SystemAI → BusinessBlueprint → ContractCompiler → SiteBundle
 */

// Capability Registry
export {
  CAPABILITY_REGISTRY,
  getCapability,
  getCapabilitiesForIndustry,
  getCapabilitiesForIntent,
  getAllowedIntents,
  getRequiredTables,
  getRequiredWorkflows,
  type CapabilityId,
  type CapabilityDefinition,
  type WorkflowSpec,
} from './capabilityRegistry';

// Industry Matrix
export {
  INDUSTRY_MATRIX,
  getIndustryProfile,
  getIndustryForCategory,
  getIndustryForSystemType,
  getAllIndustries,
  type IndustryProfile,
  type PageSpec,
} from './industryMatrix';

// Blueprint Schema
export {
  createBlueprintFromIndustry,
  type BusinessBlueprint,
  type BlueprintPage,
} from './blueprintSchema';

// Contract Compiler
export {
  compileContract,
  findNonCanonicalIntents,
  validateIntentsAgainstCapabilities,
  type ContractValidation,
  type ValidationIssue,
  type ValidationSeverity,
  type CompiledContract,
  type CompiledBinding,
  type CompiledPage,
} from './contractCompiler';
