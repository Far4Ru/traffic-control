export class EmbeddingService {
  // private useTransformer: boolean = false;
  
  async initialize() {
    // Для простоты используем fallback, transformers не обязателен
    // this.useTransformer = false;
  }
  
  async embed(text: string): Promise<number[]> {
    return this.fallbackEmbed(text);
  }
  
  private fallbackEmbed(text: string): number[] {
    // Simple word-based embedding
    const words = text.toLowerCase().split(/\s+/);
    const vector = new Array(384).fill(0);
    
    const vocabulary: Record<string, number> = {
      'скорость': 0, 'быстро': 1, 'медленно': 2,
      'машины': 3, 'трафик': 4, 'пробка': 5,
      'светофор': 6, 'красный': 7, 'зеленый': 8,
      'поворот': 9, 'право': 10, 'лево': 11,
      'стоп': 12, 'движение': 13, 'дорога': 14,
      'speed': 0, 'fast': 1, 'slow': 2,
      'cars': 3, 'traffic': 4, 'jam': 5,
      'light': 6, 'red': 7, 'green': 8,
      'turn': 9, 'right': 10, 'left': 11,
      'stop': 12, 'move': 13, 'road': 14
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