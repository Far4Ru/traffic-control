export class VectorStore {
  private vectors: Array<{ vector: number[], metadata: any }> = [];
  
  add(vector: number[], metadata: any) {
    this.vectors.push({ vector, metadata });
  }
  
  search(queryVector: number[], k: number = 3): Array<{ vector: number[], metadata: any, similarity: number }> {
    const similarities = this.vectors.map(item => ({
      ...item,
      similarity: this.cosineSimilarity(queryVector, item.vector)
    }));
    
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return similarities.slice(0, k);
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  clear() {
    this.vectors = [];
  }
  
  size(): number {
    return this.vectors.length;
  }
}