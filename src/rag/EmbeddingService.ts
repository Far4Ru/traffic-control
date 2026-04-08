export class EmbeddingService {
  private model: any = null;
  private useTransformer: boolean = false;
  
  async initialize() {
    try {
      // Try to load transformers.js
      const { pipeline } = await import('@xenova/transformers');
      this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      this.useTransformer = true;
    } catch (e) {
      console.warn('Transformers.js not available, using fallback embeddings');
    }
  }
  
  async embed(text: string): Promise<number[]> {
    if (this.useTransformer && this.model) {
      return this.transformerEmbed(text);
    } else {
      return this.fallbackEmbed(text);
    }
  }
  
  private async transformerEmbed(text: string): Promise<number[]> {
    const result = await this.model(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data);
  }
  
  private fallbackEmbed(text: string): number[] {
    // Simple word-based embedding fallback
    const words = text.toLowerCase().split(/\s+/);
    const vector = new Array(384).fill(0);
    
    const vocabulary: Record<string, number> = {
      'скорость': 0, 'быстро': 1, 'медленно': 2,
      'машины': 3, 'трафик': 4, 'пробка': 5,
      'светофор': 6, 'красный': 7, 'зеленый': 8,
      'поворот': 9, 'право': 10, 'лево': 11,
      'стоп': 12, 'движение': 13, 'дорога': 14
    };
    
    words.forEach(word => {
      if (word in vocabulary) {
        const index = vocabulary[word] % vector.length;
        vector[index] += 1;
      }
    });
    
    // Simple hash for unknown words
    words.forEach(word => {
      if (!(word in vocabulary)) {
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
          hash = ((hash << 5) - hash) + word.charCodeAt(i);
          hash = hash & hash;
        }
        vector[Math.abs(hash) % vector.length] += 0.1;
      }
    });
    
    // Normalize
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return norm > 0 ? vector.map(v => v / norm) : vector;
  }
}