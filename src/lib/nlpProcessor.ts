import { spawn } from 'child_process';

export interface ExtractedData {
  metrics: Record<string, number>;
  categories: Record<string, string[]>;
  entities: Record<string, string[]>;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  structuredData: Record<string, any>;
}

export interface NLPResult {
  originalText: string;
  extractedData: ExtractedData;
  domain: string;
  insights: string[];
  recommendations: string[];
}

export class NLPProcessor {
  private static ollamaModel = 'llama3.1:8b';
  private static ollamaUrl = 'http://localhost:11434';

  /**
   * Process natural language text and extract structured data using AI
   */
  static async processText(text: string): Promise<NLPResult> {
    try {
      console.log('=== NLP PROCESSING START ===');
      console.log('Input text:', text);
      console.log('Text length:', text.length);

      // Step 1: Use AI to extract structured data
      console.log('\n--- STEP 1: AI Data Extraction ---');
      const extractedData = await this.extractDataWithAI(text);
      console.log('Extracted data:', JSON.stringify(extractedData, null, 2));
      
      // Step 2: Determine domain and generate insights
      console.log('\n--- STEP 2: Domain Detection ---');
      const domain = await this.detectDomain(text, extractedData);
      console.log('Detected domain:', domain);
      
      console.log('\n--- STEP 3: Insight Generation ---');
      const insights = await this.generateInsights(text, extractedData, domain);
      console.log('Generated insights:', insights);
      
      console.log('\n--- STEP 4: Recommendation Generation ---');
      const recommendations = await this.generateRecommendations(text, extractedData, domain);
      console.log('Generated recommendations:', recommendations);

      const result = {
        originalText: text,
        extractedData,
        domain,
        insights,
        recommendations
      };

      console.log('\n=== FINAL NLP RESULT ===');
      console.log(JSON.stringify(result, null, 2));
      console.log('=== NLP PROCESSING END ===\n');

      return result;
    } catch (error) {
      console.error('NLP processing error:', error);
      return this.getFallbackResult(text);
    }
  }

  /**
   * Use Ollama AI to extract structured data from text
   */
  private static async extractDataWithAI(text: string): Promise<ExtractedData> {
    try {
      const prompt = this.buildExtractionPrompt(text);
      console.log('AI Prompt:', prompt);
      
      const response = await this.callOllama(prompt);
      console.log('Raw AI Response:', response);
      
      const parsedData = this.parseAIResponse(response);
      console.log('Parsed AI Response:', JSON.stringify(parsedData, null, 2));
      
      return parsedData;
    } catch (error) {
      console.error('AI extraction error:', error);
      console.log('Falling back to rule-based extraction...');
      return this.extractDataWithRules(text);
    }
  }

  /**
   * Build prompt for AI data extraction
   */
  private static buildExtractionPrompt(text: string): string {
    return `You are an expert data analyst. Extract structured data from this text and return it as JSON.

Text: "${text}"

Extract the following information:
1. NUMBERS: Any numerical values with their context (e.g., "2 goals" -> {"goals": 2})
2. METRICS: Performance metrics, measurements, scores
3. CATEGORIES: Group related items (e.g., "goals, assists" -> "sports_performance")
4. ENTITIES: People, places, objects, concepts mentioned
5. SENTIMENT: Overall tone (positive/negative/neutral)
6. IMPROVEMENT_AREAS: Things that need work or improvement

Return ONLY valid JSON in this exact format:
{
  "metrics": {"metric_name": number},
  "categories": {"category_name": ["item1", "item2"]},
  "entities": {"entity_type": ["entity1", "entity2"]},
  "sentiment": "positive|negative|neutral",
  "confidence": 0.95,
  "structuredData": {"key": "value"}
}

Be precise and extract all relevant information.`;
  }

  /**
   * Call Ollama AI service
   */
  private static async callOllama(prompt: string): Promise<string> {
    try {
      console.log('Checking Ollama availability...');
      // First, check if Ollama is available
      const isAvailable = await this.checkOllamaAvailability();
      console.log('Ollama available:', isAvailable);
      
      if (isAvailable) {
        console.log('Using Ollama API...');
        return await this.callOllamaAPI(prompt);
      } else {
        // Fallback to local processing
        console.log('Ollama not available, using local processing...');
        return await this.processLocally(prompt);
      }
    } catch (error) {
      console.error('Ollama call error:', error);
      console.log('Falling back to local processing due to error...');
      return await this.processLocally(prompt);
    }
  }

  /**
   * Check if Ollama is available
   */
  private static async checkOllamaAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      console.log('Ollama not available, using local processing');
      return false;
    }
  }

  /**
   * Call Ollama API
   */
  private static async callOllamaAPI(prompt: string): Promise<string> {
    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.ollamaModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
          max_tokens: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const result = await response.json();
    return result.response;
  }

  /**
   * Advanced local processing using regex and NLP techniques
   */
  private static async processLocally(prompt: string): Promise<string> {
    // Extract the original text from the prompt
    const textMatch = prompt.match(/Text: "([^"]+)"/);
    const text = textMatch ? textMatch[1] : '';
    
    if (!text) {
      throw new Error('No text found in prompt');
    }

    // Advanced NLP processing
    const metrics = this.extractMetrics(text);
    const categories = this.categorizeContent(text);
    const entities = this.extractEntities(text);
    const sentiment = this.analyzeSentiment(text);
    const structuredData = this.createStructuredData(text, metrics, categories, entities);

    return JSON.stringify({
      metrics,
      categories,
      entities,
      sentiment,
      confidence: 0.85,
      structuredData
    });
  }

  /**
   * Extract numerical metrics from text
   */
  private static extractMetrics(text: string): Record<string, number> {
    console.log('Extracting metrics from text...');
    const metrics: Record<string, number> = {};
    
    // Pattern for "number + word" (e.g., "2 goals", "7 miles")
    const metricPattern = /(\d+(?:\.\d+)?)\s+([a-zA-Z]+)/g;
    let match;
    
    while ((match = metricPattern.exec(text)) !== null) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      console.log(`Found metric: ${value} ${unit}`);
      
      // Map common units to standardized names
      const unitMap: Record<string, string> = {
        'goal': 'goals',
        'goals': 'goals',
        'assist': 'assists',
        'assists': 'assists',
        'mile': 'miles',
        'miles': 'miles',
        'km': 'kilometers',
        'kilometer': 'kilometers',
        'kilometers': 'kilometers',
        'minute': 'minutes',
        'minutes': 'minutes',
        'hour': 'hours',
        'hours': 'hours',
        'day': 'days',
        'days': 'days',
        'week': 'weeks',
        'weeks': 'weeks',
        'month': 'months',
        'months': 'months',
        'year': 'years',
        'years': 'years',
        'pound': 'pounds',
        'pounds': 'pounds',
        'kg': 'kilograms',
        'kilogram': 'kilograms',
        'kilograms': 'kilograms',
        'point': 'points',
        'points': 'points',
        'score': 'score',
        'scores': 'score',
        'percent': 'percentage',
        'percentage': 'percentage',
        '%': 'percentage'
      };
      
      const metricName = unitMap[unit] || unit;
      metrics[metricName] = value;
      console.log(`Mapped to: ${metricName} = ${value}`);
    }
    
    // Extract standalone numbers with context
    const contextPattern = /(\d+(?:\.\d+)?)\s*(?:goals?|assists?|miles?|kilometers?|minutes?|hours?|days?|weeks?|months?|years?|pounds?|kilograms?|points?|scores?|percent)/gi;
    while ((match = contextPattern.exec(text)) !== null) {
      const value = parseFloat(match[1]);
      const context = match[0].toLowerCase();
      console.log(`Found context metric: ${context} = ${value}`);
      
      if (context.includes('goal')) metrics.goals = value;
      if (context.includes('assist')) metrics.assists = value;
      if (context.includes('mile')) metrics.miles = value;
      if (context.includes('kilometer')) metrics.kilometers = value;
      if (context.includes('minute')) metrics.minutes = value;
      if (context.includes('hour')) metrics.hours = value;
      if (context.includes('day')) metrics.days = value;
      if (context.includes('week')) metrics.weeks = value;
      if (context.includes('month')) metrics.months = value;
      if (context.includes('year')) metrics.years = value;
      if (context.includes('pound')) metrics.pounds = value;
      if (context.includes('kilogram')) metrics.kilograms = value;
      if (context.includes('point')) metrics.points = value;
      if (context.includes('score')) metrics.score = value;
      if (context.includes('percent')) metrics.percentage = value;
    }
    
    console.log('Final extracted metrics:', metrics);
    return metrics;
  }

  /**
   * Categorize content into meaningful groups
   */
  private static categorizeContent(text: string): Record<string, string[]> {
    const categories: Record<string, string[]> = {
      sports_performance: [],
      health_metrics: [],
      improvement_areas: [],
      activities: [],
      measurements: [],
      food: [],
      home: []
    };
    
    const lowerText = text.toLowerCase();
    
    // Sports performance indicators
    if (lowerText.includes('goal') || lowerText.includes('assist') || 
        lowerText.includes('score') || lowerText.includes('point')) {
      categories.sports_performance.push('performance_metrics');
    }
    
    // Health metrics
    if (lowerText.includes('mile') || lowerText.includes('kilometer') || 
        lowerText.includes('run') || lowerText.includes('exercise')) {
      categories.health_metrics.push('fitness_tracking');
    }
    
    // Improvement areas
    if (lowerText.includes('need') || lowerText.includes('better') || 
        lowerText.includes('improve') || lowerText.includes('work on')) {
      categories.improvement_areas.push('skill_development');
    }
    
    // Activities
    if (lowerText.includes('run') || lowerText.includes('exercise') || 
        lowerText.includes('train') || lowerText.includes('practice')) {
      categories.activities.push('physical_activity');
    }
    
    // Measurements
    if (lowerText.includes('mile') || lowerText.includes('kilometer') || 
        lowerText.includes('minute') || lowerText.includes('hour')) {
      categories.measurements.push('distance_time');
    }
    
    // Food indicators
    const foodWords = [
      'lunch', 'dinner', 'breakfast', 'rice', 'curry', 'egg', 'meal', 'cook', 'kitchen', 'dish', 'spice', 'vegetable', 'delicious', 'taste', 'menu', 'phenomenal', 'recipe', 'food', 'snack', 'eat', 'eating', 'plate', 'flavor', 'sambar', 'thenga', 'chutney', 'cooking', 'prepared'
    ];
    if (foodWords.some(word => lowerText.includes(word))) {
      categories.food.push('meal');
    }
    
    // Home indicators
    const homeWords = [
      'home', 'family', 'house', 'room', 'living', 'kitchen', 'clean', 'organize', 'decorate', 'relax', 'comfort', 'chores', 'sofa', 'bed', 'living room', 'dining', 'apartment', 'residence', 'stay', 'household', 'domestic', 'tidy', 'laundry', 'sweep', 'mop', 'vacuum'
    ];
    if (homeWords.some(word => lowerText.includes(word))) {
      categories.home.push('home_life');
    }
    
    return categories;
  }

  /**
   * Extract named entities and concepts
   */
  private static extractEntities(text: string): Record<string, string[]> {
    const entities: Record<string, string[]> = {
      body_parts: [],
      skills: [],
      activities: [],
      measurements: [],
      time_periods: [],
      food_items: [],
      home_items: []
    };
    
    const lowerText = text.toLowerCase();
    
    // Body parts
    const bodyParts = ['foot', 'feet', 'hand', 'hands', 'leg', 'legs', 'arm', 'arms', 'head', 'eye', 'eyes'];
    bodyParts.forEach(part => {
      if (lowerText.includes(part)) {
        entities.body_parts.push(part);
      }
    });
    
    // Skills
    const skills = ['goal', 'assist', 'run', 'kick', 'pass', 'shoot', 'dribble'];
    skills.forEach(skill => {
      if (lowerText.includes(skill)) {
        entities.skills.push(skill);
      }
    });
    
    // Activities
    const activities = ['run', 'exercise', 'train', 'practice', 'play'];
    activities.forEach(activity => {
      if (lowerText.includes(activity)) {
        entities.activities.push(activity);
      }
    });
    
    // Measurements
    const measurements = ['mile', 'kilometer', 'minute', 'hour', 'day'];
    measurements.forEach(measurement => {
      if (lowerText.includes(measurement)) {
        entities.measurements.push(measurement);
      }
    });
    
    // Time periods
    const timePeriods = ['today', 'yesterday', 'tomorrow', 'week', 'month', 'year'];
    timePeriods.forEach(period => {
      if (lowerText.includes(period)) {
        entities.time_periods.push(period);
      }
    });
    
    // Food items
    const foodItems = [
      'rice', 'curry', 'egg', 'thenga', 'sambar', 'chutney', 'dal', 'roti', 'bread', 'vegetable', 'salad', 'chicken', 'fish', 'meat', 'paneer', 'tofu', 'soup', 'noodle', 'pasta', 'spice', 'pepper', 'salt', 'oil', 'ghee', 'butter', 'milk', 'yogurt', 'curd', 'fruit', 'banana', 'apple', 'orange', 'mango', 'grape', 'berry', 'snack', 'sweet', 'dessert', 'ice cream', 'cake', 'cookie', 'biscuit', 'juice', 'tea', 'coffee'
    ];
    foodItems.forEach(item => {
      if (lowerText.includes(item)) {
        entities.food_items.push(item);
      }
    });
    
    // Home items
    const homeItems = [
      'sofa', 'bed', 'table', 'chair', 'lamp', 'couch', 'curtain', 'carpet', 'rug', 'pillow', 'blanket', 'sheet', 'wardrobe', 'closet', 'drawer', 'kitchen', 'sink', 'stove', 'oven', 'fridge', 'microwave', 'dishwasher', 'laundry', 'washing machine', 'dryer', 'vacuum', 'broom', 'mop', 'bucket', 'towel', 'mirror', 'toilet', 'shower', 'bathtub', 'door', 'window', 'balcony', 'garden', 'yard', 'garage', 'fence', 'gate', 'roof', 'wall', 'floor', 'ceiling', 'fan', 'ac', 'heater', 'fireplace'
    ];
    homeItems.forEach(item => {
      if (lowerText.includes(item)) {
        entities.home_items.push(item);
      }
    });
    
    return entities;
  }

  /**
   * Analyze sentiment of the text
   */
  private static analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const lowerText = text.toLowerCase();
    
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'fantastic', 'perfect', 'improved', 'better'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'worse', 'needs', 'problem', 'issue'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeScore++;
    });
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  /**
   * Create structured data object
   */
  private static createStructuredData(
    text: string, 
    metrics: Record<string, number>, 
    categories: Record<string, string[]>, 
    entities: Record<string, string[]>
  ): Record<string, any> {
    return {
      originalText: text,
      extractedMetrics: metrics,
      categories: categories,
      entities: entities,
      timestamp: new Date().toISOString(),
      processingMethod: 'advanced_nlp'
    };
  }

  /**
   * Parse AI response into structured format
   */
  private static parseAIResponse(response: string): ExtractedData {
    console.log('Parsing AI response...');
    console.log('Response type:', typeof response);
    console.log('Response length:', response.length);
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('Found JSON match:', jsonMatch[0]);
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed JSON:', parsed);
        
        const result = {
          metrics: parsed.metrics || {},
          categories: parsed.categories || {},
          entities: parsed.entities || {},
          sentiment: parsed.sentiment || 'neutral',
          confidence: parsed.confidence || 0.8,
          structuredData: parsed.structuredData || {}
        };
        
        console.log('Parsed result:', result);
        return result;
      } else {
        console.log('No JSON found in response, using fallback');
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Response that failed to parse:', response);
    }
    
    // Fallback to rule-based extraction
    console.log('Using rule-based extraction as fallback');
    return this.extractDataWithRules(response);
  }

  /**
   * Rule-based data extraction as fallback
   */
  private static extractDataWithRules(text: string): ExtractedData {
    const metrics = this.extractMetrics(text);
    const categories = this.categorizeContent(text);
    const entities = this.extractEntities(text);
    const sentiment = this.analyzeSentiment(text);
    const structuredData = this.createStructuredData(text, metrics, categories, entities);
    
    return {
      metrics,
      categories,
      entities,
      sentiment,
      confidence: 0.7,
      structuredData
    };
  }

  /**
   * Detect domain of the text
   */
  private static async detectDomain(text: string, extractedData: ExtractedData): Promise<string> {
    const lowerText = text.toLowerCase();
    // Food domain
    const foodWords = [
      'lunch', 'dinner', 'breakfast', 'rice', 'curry', 'egg', 'meal', 'cook', 'kitchen', 'dish', 'spice', 'vegetable', 'delicious', 'taste', 'menu', 'phenomenal', 'recipe', 'food', 'snack', 'eat', 'eating', 'plate', 'flavor', 'sambar', 'thenga', 'chutney', 'cooking', 'prepared'
    ];
    if (
      foodWords.some(word => lowerText.includes(word)) ||
      (extractedData.entities.food_items && extractedData.entities.food_items.length > 0) ||
      (extractedData.categories.food && extractedData.categories.food.length > 0)
    ) {
      return 'food';
    }
    // Home domain
    const homeWords = [
      'home', 'family', 'house', 'room', 'living', 'kitchen', 'clean', 'organize', 'decorate', 'relax', 'comfort', 'chores', 'sofa', 'bed', 'living room', 'dining', 'apartment', 'residence', 'stay', 'household', 'domestic', 'tidy', 'laundry', 'sweep', 'mop', 'vacuum'
    ];
    if (
      homeWords.some(word => lowerText.includes(word)) ||
      (extractedData.entities.home_items && extractedData.entities.home_items.length > 0) ||
      (extractedData.categories.home && extractedData.categories.home.length > 0)
    ) {
      return 'home';
    }
    // Sports domain
    if (lowerText.includes('goal') || lowerText.includes('assist') || 
        lowerText.includes('foot') || lowerText.includes('soccer') || 
        lowerText.includes('football') || extractedData.metrics.goals || 
        extractedData.metrics.assists) {
      return 'sports';
    }
    // Health/Fitness domain
    if (lowerText.includes('mile') || lowerText.includes('run') || 
        lowerText.includes('exercise') || lowerText.includes('workout') || 
        extractedData.metrics.miles || extractedData.metrics.kilometers) {
      return 'health';
    }
    // Productivity domain
    if (lowerText.includes('task') || lowerText.includes('project') || 
        lowerText.includes('work') || lowerText.includes('meeting')) {
      return 'productivity';
    }
    // Financial domain
    if (lowerText.includes('dollar') || lowerText.includes('money') || 
        lowerText.includes('cost') || lowerText.includes('price') || 
        lowerText.includes('budget')) {
      return 'financial';
    }
    return 'general';
  }

  /**
   * Generate insights from processed data
   */
  private static async generateInsights(
    text: string, 
    extractedData: ExtractedData, 
    domain: string
  ): Promise<string[]> {
    console.log('Generating insights for domain:', domain);
    console.log('Extracted data for insights:', extractedData);
    
    const insights: string[] = [];
    // Basic metric insights - always include these if they exist
    Object.entries(extractedData.metrics).forEach(([key, value]) => {
      if (typeof value === 'number' && value > 0) {
        insights.push(`${key}: ${value}`);
      }
    });
    // Domain-specific insights
    if (domain === 'sports') {
      if (extractedData.metrics.goals) {
        insights.push(`Scored ${extractedData.metrics.goals} goals`);
      }
      if (extractedData.metrics.assists) {
        insights.push(`Provided ${extractedData.metrics.assists} assists`);
      }
      if (extractedData.metrics.miles) {
        insights.push(`Ran ${extractedData.metrics.miles} miles`);
      }
    } else if (domain === 'health') {
      if (extractedData.metrics.miles) {
        insights.push(`Completed ${extractedData.metrics.miles} miles`);
      }
      if (extractedData.metrics.minutes) {
        insights.push(`Worked out for ${extractedData.metrics.minutes} minutes`);
      }
    } else if (domain === 'food') {
      if (extractedData.entities.food_items && extractedData.entities.food_items.length > 0) {
        insights.push(`Food items: ${extractedData.entities.food_items.join(', ')}`);
      }
      if (extractedData.sentiment === 'positive') {
        insights.push('Overall positive performance, well prepared meal.');
      } else if (extractedData.sentiment === 'negative') {
        insights.push('Meal could be improved.');
      } else {
        insights.push('Meal was okay.');
      }
      if (text.toLowerCase().includes('spice')) {
        insights.push('Spice level mentioned.');
      }
    } else if (domain === 'home') {
      if (extractedData.entities.home_items && extractedData.entities.home_items.length > 0) {
        insights.push(`Home items mentioned: ${extractedData.entities.home_items.join(', ')}`);
      }
      if (extractedData.sentiment === 'positive') {
        insights.push('Home environment is positive and comfortable.');
      } else if (extractedData.sentiment === 'negative') {
        insights.push('Some issues at home, consider improvements.');
      } else {
        insights.push('Home situation is stable.');
      }
    }
    // Entity-based insights
    if (extractedData.entities.body_parts && extractedData.entities.body_parts.length > 0) {
      insights.push(`Focus area: ${extractedData.entities.body_parts.join(', ')}`);
    }
    if (extractedData.entities.skills && extractedData.entities.skills.length > 0) {
      insights.push(`Skills mentioned: ${extractedData.entities.skills.join(', ')}`);
    }
    // Sentiment insights
    if (extractedData.sentiment === 'positive' && domain !== 'food' && domain !== 'home') {
      insights.push('Overall positive performance');
    } else if (extractedData.sentiment === 'negative' && domain !== 'food' && domain !== 'home') {
      insights.push('Areas for improvement identified');
    }
    // If no insights generated, create basic ones from the text
    if (insights.length === 0) {
      insights.push(`Processed ${domain} data`);
      insights.push(`Text contains ${text.split(' ').length} words`);
      if (Object.keys(extractedData.metrics).length > 0) {
        insights.push(`Found ${Object.keys(extractedData.metrics).length} metrics`);
      }
    }
    console.log('Generated insights:', insights);
    return insights;
  }

  /**
   * Generate recommendations based on data
   */
  private static async generateRecommendations(
    text: string, 
    extractedData: ExtractedData, 
    domain: string
  ): Promise<string[]> {
    console.log('Generating recommendations for domain:', domain);
    const recommendations: string[] = [];
    // Sports recommendations
    if (domain === 'sports') {
      if (extractedData.entities.body_parts && extractedData.entities.body_parts.includes('foot')) {
        recommendations.push('Practice footwork drills to improve technique');
      }
      if (extractedData.metrics.goals && extractedData.metrics.goals < 3) {
        recommendations.push('Focus on shooting accuracy in training');
      }
      if (extractedData.metrics.assists && extractedData.metrics.assists > 0) {
        recommendations.push('Good teamwork - continue building on assists');
      }
    }
    // Health recommendations
    if (domain === 'health') {
      if (extractedData.metrics.miles && extractedData.metrics.miles < 5) {
        recommendations.push('Gradually increase running distance');
      }
      if (extractedData.metrics.miles && extractedData.metrics.miles >= 5) {
        recommendations.push('Great distance - consider adding speed work');
      }
    }
    // Food recommendations
    if (domain === 'food') {
      if (text.toLowerCase().includes('spice')) {
        recommendations.push('Keep an eye on spice levels next time you prepare this.');
      }
      if (extractedData.entities.food_items && !extractedData.entities.food_items.some(item => ['vegetable', 'salad', 'fruit'].includes(item))) {
        recommendations.push('Also eat some vegetables goddamn it.');
      }
      if (extractedData.sentiment === 'positive') {
        recommendations.push('Keep up the good work in the kitchen!');
      } else if (extractedData.sentiment === 'negative') {
        recommendations.push('Try tweaking the recipe for better results next time.');
      }
    }
    // Home recommendations
    if (domain === 'home') {
      if (extractedData.entities.home_items && extractedData.entities.home_items.length > 0) {
        recommendations.push('Keep your home organized and comfortable.');
      }
      if (text.toLowerCase().includes('clean') || text.toLowerCase().includes('tidy')) {
        recommendations.push('Great job keeping things clean!');
      }
      if (extractedData.sentiment === 'negative') {
        recommendations.push('Consider small changes to improve your home environment.');
      } else if (extractedData.sentiment === 'positive') {
        recommendations.push('Enjoy your cozy home!');
      }
    }
    // General recommendations based on sentiment
    if (extractedData.sentiment === 'negative' && recommendations.length === 0) {
      recommendations.push('Review performance and identify specific improvement areas');
    } else if (extractedData.sentiment === 'positive' && recommendations.length === 0) {
      recommendations.push('Keep up the good work and maintain consistency');
    }
    // Default recommendations if none generated
    if (recommendations.length === 0) {
      recommendations.push('Continue tracking your progress');
      recommendations.push('Set specific goals for improvement');
    }
    console.log('Generated recommendations:', recommendations);
    return recommendations;
  }

  /**
   * Get fallback result when processing fails
   */
  private static getFallbackResult(text: string): NLPResult {
    return {
      originalText: text,
      extractedData: {
        metrics: {},
        categories: {},
        entities: {},
        sentiment: 'neutral',
        confidence: 0.0,
        structuredData: {}
      },
      domain: 'general',
      insights: ['Unable to process text with AI'],
      recommendations: ['Try rephrasing the text or check AI service availability']
    };
  }
} 