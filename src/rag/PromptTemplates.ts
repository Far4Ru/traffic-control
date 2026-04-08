interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  action: string;
  parameters: Record<string, any>;
}

export class PromptTemplates {
  private templates: Template[] = [
    {
      id: 'normal_flow',
      name: 'Обычное движение',
      description: 'стандартное движение машин соблюдение правил нормальная скорость',
      prompt: 'Сделай обычное движение машин на перекрестке',
      action: 'normal_flow',
      parameters: {
        speedMultiplier: 1.0,
        densityMultiplier: 1.0,
        trafficLightsEnabled: true,
        aggressionLevel: 1.0
      }
    },
    {
      id: 'rush_hour',
      name: 'Час пик',
      description: 'много машин высокая плотность трафика пробки медленное движение',
      prompt: 'Включи режим час пик с большим количеством машин',
      action: 'rush_hour',
      parameters: {
        speedMultiplier: 0.6,
        densityMultiplier: 2.5,
        trafficLightsEnabled: true,
        aggressionLevel: 0.8
      }
    },
    {
      id: 'free_flow',
      name: 'Свободное движение',
      description: 'мало машин высокая скорость свободная дорога без пробок',
      prompt: 'Сделай свободное движение, убери пробки',
      action: 'free_flow',
      parameters: {
        speedMultiplier: 1.5,
        densityMultiplier: 0.4,
        trafficLightsEnabled: true,
        aggressionLevel: 1.2
      }
    },
    {
      id: 'no_lights',
      name: 'Без светофоров',
      description: 'отключить светофоры только правило правой руки приоритет',
      prompt: 'Отключи светофоры, используй только правило правой руки',
      action: 'no_lights',
      parameters: {
        speedMultiplier: 1.0,
        densityMultiplier: 1.0,
        trafficLightsEnabled: false,
        aggressionLevel: 1.3
      }
    },
    {
      id: 'aggressive',
      name: 'Агрессивное вождение',
      description: 'агрессивные водители высокая скорость резкие маневры',
      prompt: 'Сделай агрессивное вождение на перекрестке',
      action: 'aggressive',
      parameters: {
        speedMultiplier: 1.8,
        densityMultiplier: 1.0,
        trafficLightsEnabled: true,
        aggressionLevel: 2.0
      }
    },
    {
      id: 'cautious',
      name: 'Осторожное вождение',
      description: 'осторожные водители низкая скорость большая дистанция',
      prompt: 'Включи осторожный режим вождения',
      action: 'cautious',
      parameters: {
        speedMultiplier: 0.5,
        densityMultiplier: 1.0,
        trafficLightsEnabled: true,
        aggressionLevel: 0.3
      }
    }
  ];

  getAllBehaviors(): Template[] {
    return this.templates;
  }

  getTemplateById(id: string): Template | undefined {
    return this.templates.find(t => t.id === id);
  }

  getTemplatePrompts(): Array<{ id: string; name: string; prompt: string }> {
    return this.templates.map(t => ({
      id: t.id,
      name: t.name,
      prompt: t.prompt
    }));
  }
}