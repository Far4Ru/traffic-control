export class EmbeddingService {
  private readonly dimension: number = 384;

  async embed(text: string): Promise<number[]> {
    return this.fallbackEmbed(text);
  }

  private fallbackEmbed(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const vector = new Array(this.dimension).fill(0);

    const vocabulary: Record<string, number> = {
      // Русские слова
      'скорость': 0, 'быстро': 1, 'медленно': 2,
      'машины': 3, 'трафик': 4, 'пробка': 5,
      'светофор': 6, 'красный': 7, 'зеленый': 8, 'желтый': 9,
      'поворот': 10, 'право': 11, 'лево': 12,
      'стоп': 13, 'движение': 14, 'дорога': 15,
      'агрессивный': 16, 'осторожный': 17, 'час': 18, 'пик': 19,
      'свободный': 20, 'поток': 21, 'плотность': 22,
      'вождение': 23, 'режим': 24, 'обычный': 25,

      // Английские слова
      'speed': 0, 'fast': 1, 'slow': 2,
      'cars': 3, 'traffic': 4, 'jam': 5,
      'light': 6, 'red': 7, 'green': 8, 'yellow': 9,
      'turn': 10, 'right': 11, 'left': 12,
      'stop': 13, 'move': 14, 'road': 15,
      'aggressive': 16, 'cautious': 17, 'rush': 18, 'hour': 19,
      'free': 20, 'flow': 21, 'density': 22,
      'driving': 23, 'mode': 24, 'normal': 25
    };

    words.forEach(word => {
      const cleanWord = word.replace(/[^\wа-яё]/gi, '');
      if (cleanWord in vocabulary) {
        const index = vocabulary[cleanWord] % this.dimension;
        vector[index] += 1;
      }
    });

    // Хеширование неизвестных слов
    words.forEach(word => {
      const cleanWord = word.replace(/[^\wа-яё]/gi, '');
      if (!(cleanWord in vocabulary) && cleanWord.length > 0) {
        let hash = 0;
        for (let i = 0; i < cleanWord.length; i++) {
          hash = ((hash << 5) - hash) + cleanWord.charCodeAt(i);
          hash = hash & hash;
        }
        vector[Math.abs(hash) % this.dimension] += 0.1;
      }
    });

    // Нормализация
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return norm > 0 ? vector.map(v => v / norm) : vector;
  }
}