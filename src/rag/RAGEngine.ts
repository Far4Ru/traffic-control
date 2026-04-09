import { VectorStore } from './VectorStore';
import { EmbeddingService } from './EmbeddingService';
import { PromptTemplates } from './PromptTemplates';

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
  private initialized: boolean = false;

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

    this.initialized = true;
  }

  async processPrompt(prompt: string): Promise<RAGResult> {
    const cacheKey = this.hashPrompt(prompt);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const promptEmbedding = await this.embeddingService.embed(prompt);
    const similar = this.vectorStore.search(promptEmbedding, 3);

    const result = this.interpolateBehavior(similar, prompt);
    this.cache.set(cacheKey, result);

    return result;
  }

  private interpolateBehavior(
    similar: Array<{ vector: number[], metadata: any, similarity: number }>,
    prompt: string
  ): RAGResult {
    if (similar.length === 0 || similar[0].similarity < 0.5) {
      return this.getDefaultBehavior();
    }

    const bestMatch = similar[0];
    const parameters = this.extractParameters(prompt);

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
    const lowerPrompt = prompt.toLowerCase();

    // Скорость
    if (lowerPrompt.includes('быстро') || lowerPrompt.includes('fast')) {
      params.speedMultiplier = 1.5;
    }
    if (lowerPrompt.includes('медленно') || lowerPrompt.includes('slow')) {
      params.speedMultiplier = 0.6;
    }

    // Плотность
    if (lowerPrompt.includes('много машин') || lowerPrompt.includes('пробка') || lowerPrompt.includes('час пик')) {
      params.densityMultiplier = 2.0;
    }
    if (lowerPrompt.includes('мало машин') || lowerPrompt.includes('свободн')) {
      params.densityMultiplier = 0.5;
    }

    // Светофоры
    if (lowerPrompt.includes('без светофор') || lowerPrompt.includes('отключи')) {
      params.trafficLightsEnabled = false;
    }
    if (lowerPrompt.includes('включи светофор')) {
      params.trafficLightsEnabled = true;
    }

    // Агрессивность
    if (lowerPrompt.includes('агрессивн')) {
      params.aggressionLevel = 1.8;
    }
    if (lowerPrompt.includes('осторожн') || lowerPrompt.includes('аккуратн')) {
      params.aggressionLevel = 0.5;
    }

    return params;
  }

  private generateExplanation(behavior: any, params: Record<string, any>): string {
    let explanation = `Применено: ${behavior.name}. `;

    if (params.speedMultiplier) {
      const speedPercent = Math.round(params.speedMultiplier * 100);
      explanation += `Скорость ${speedPercent}%. `;
    }
    if (params.densityMultiplier) {
      explanation += `Плотность ${params.densityMultiplier > 1 ? 'повышена' : 'понижена'}. `;
    }
    if (params.trafficLightsEnabled !== undefined) {
      explanation += `Светофоры ${params.trafficLightsEnabled ? 'включены' : 'отключены'}. `;
    }

    return explanation || 'Применено стандартное поведение.';
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