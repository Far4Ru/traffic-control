import { RAGEngine, RAGControlSystem, PromptTemplates } from '../../rag';

export class RAGPanel {
    private templates: PromptTemplates;

    constructor(
        private ragEngine: RAGEngine,
        private ragSystem: RAGControlSystem
    ) {
        this.templates = new PromptTemplates();
    }

    render(): string {
        return `
      <div class="control-section">
        <h3>🤖 RAG Управление</h3>
        <textarea id="prompt-input" class="prompt-input" placeholder="Введите промпт..."></textarea>
        <button id="submit-prompt" class="btn btn-primary" style="margin-top: 10px; width: 100%;">Отправить</button>
        <div id="rag-status" class="rag-status">Готов к обработке</div>
      </div>
      
      <div class="control-section">
        <h3>📋 Шаблоны</h3>
        <div class="template-list" id="template-list"></div>
      </div>
    `;
    }

    setupEventListeners(): void {
        this.renderTemplates();

        document.getElementById('submit-prompt')?.addEventListener('click', async () => {
            await this.handlePromptSubmit();
        });
    }

    private renderTemplates(): void {
        const list = document.getElementById('template-list')!;
        const prompts = this.templates.getTemplatePrompts();

        prompts.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'template-btn';
            btn.textContent = t.name;
            btn.onclick = () => {
                (document.getElementById('prompt-input') as HTMLTextAreaElement).value = t.prompt;
            };
            list.appendChild(btn);
        });
    }

    private async handlePromptSubmit(): Promise<void> {
        const input = document.getElementById('prompt-input') as HTMLTextAreaElement;
        const prompt = input.value.trim();
        if (!prompt) return;

        const status = document.getElementById('rag-status')!;
        status.textContent = 'Обработка...';
        status.style.color = '#f9ca24';

        try {
            await this.ragSystem.processPrompt(prompt);
            const behavior = this.ragSystem.getCurrentBehavior();

            if (behavior) {
                status.innerHTML = `
          <strong>Применено:</strong> ${behavior.explanation}<br>
          <small>Уверенность: ${(behavior.confidence * 100).toFixed(1)}%</small>
        `;
                status.style.color = '#00d2ff';
            }
        } catch (e) {
            status.textContent = 'Ошибка обработки';
            status.style.color = '#e94560';
        }
    }
}