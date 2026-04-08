import { VectorStore } from './VectorStore.ts';
import { EmbeddingService } from './EmbeddingService.ts';
import { PromptTemplates } from './PromptTemplates.ts';

export interface RAGResult {
  action: string;
  parameters: Record<string, any>;
  confidence: number;
  explanation: string;
}

export class RAGEngine {
  private vectorStore: VectorStore;
  private embeddingService: EmbeddingService;
  private templates: PromptTemplates;
  private cache: Map<string, RAGResult> = new Map();
  
  constructor() {
    this.vectorStore = new VectorStore();
    this.embeddingService = new EmbeddingService();
    this.templates = new PromptTemplates();
    
    this.initializeVectorStore();
  }
  
  private async initializeVectorStore() {
    const behaviors = this.templates.getAllBehaviors();
    
    for (const behavior of behaviors) {
      const embedding = await this.embeddingService.embed(behavior.description);
      this.vectorStore.add(embedding, behavior);
    }
  }
  
  async processPrompt(prompt: string): Promise<RAGResult> {
    // Check cache
    const cacheKey = this.hashPrompt(prompt);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    // Generate embedding for user prompt
    const promptEmbedding = await this.embeddingService.embed(prompt);
    
    // Find similar behaviors
    const similar = this.vectorStore.search(promptEmbedding, 3);
    
    // Interpolate behavior based on similarities
    const result = this.interpolateBehavior(similar, prompt);
    
    // Cache result
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  private interpolateBehavior(
    similar: Array<{ vector: number[], metadata: any, similarity: number }>,
    prompt: string
  ): RAGResult {
    if (similar.length === 0) {
      return this.getDefaultBehavior();
    }
    
    const bestMatch = similar[0];
    
    // Extract parameters from prompt using simple NLP
    const parameters = this.extractParameters(prompt);
    
    // Merge with template parameters
    const mergedParams = {
      ...bestMatch.metadata.parameters,
      ...parameters
    };
    
    return {
      action: bestMatch.metadata.action,
      parameters: mergedParams,
      confidence: bestMatch.similarity,
      explanation: this.generateExplanation(bestMatch.metadata, parameters)
    };
  }
  
  private extractParameters(prompt: string): Record<string, any> {
    const params: Record<string, any> = {};
    
    // Extract speed
    const speedMatch = prompt.match(/скорость\s+(\d+)/i);
    if (speedMatch) {
      params.speedMultiplier = parseInt(speedMatch[1]) / 50;
    }
    
    // Extract density
    const densityMatch = prompt.match(/(больше|меньше|много|мало)\s+(машин|трафика)/i);
    if (densityMatch) {
      params.densityMultiplier = densityMatch[1] === 'больше' || densityMatch[1] === 'много' ? 2 : 0.5;
    }
    
    // Extract traffic light mode
    if (prompt.includes('без светофор')) {
      params.trafficLightsEnabled = false;
    }
    if (prompt.includes('со светофор')) {
      params.trafficLightsEnabled = true;
    }
    
    // Extract aggression level
    if (prompt.includes('агрессивн')) {
      params.aggressionLevel = 1.5;
    }
    if (prompt.includes('осторожн')) {
      params.aggressionLevel = 0.5;
    }
    
    return params;
  }
  
  private generateExplanation(behavior: any, params: Record<string, any>): string {
    let explanation = `Применено поведение: ${behavior.description}. `;
    
    if (params.speedMultiplier) {
      explanation += `Скорость изменена на ${Math.round(params.speedMultiplier * 100)}%. `;
    }
    if (params.densityMultiplier) {
      explanation += `Плотность трафика: ${params.densityMultiplier > 1 ? 'повышена' : 'понижена'}. `;
    }
    if (params.trafficLightsEnabled !== undefined) {
      explanation += `Светофоры ${params.trafficLightsEnabled ? 'включены' : 'отключены'}. `;
    }
    
    return explanation;
  }
  
  private hashPrompt(prompt: string): string {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
  
  private getDefaultBehavior(): RAGResult {
    return {
      action: 'normal_flow',
      parameters: {
        speedMultiplier: 1.0,
        densityMultiplier: 1.0,
        trafficLightsEnabled: true,
        aggressionLevel: 1.0
      },
      confidence: 0.5,
      explanation: 'Применено стандартное поведение движения.'
    };
  }
}