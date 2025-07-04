# Advanced NLP Processing System

## Overview

The app now features a cutting-edge Natural Language Processing (NLP) system that intelligently extracts structured data from natural language input. This system uses advanced AI techniques to understand context, extract metrics, and generate insights from unstructured text.

## Features

### 🤖 AI-Powered Data Extraction
- **Open Source AI Integration**: Uses Ollama with Llama 3.1 for local AI processing
- **Fallback Processing**: Advanced rule-based NLP when AI is unavailable
- **Context Understanding**: Extracts meaning from natural language descriptions

### 📊 Intelligent Data Parsing
- **Metric Extraction**: Automatically identifies and extracts numerical values with context
- **Entity Recognition**: Detects people, places, objects, and concepts
- **Category Classification**: Groups related information into meaningful categories
- **Sentiment Analysis**: Determines the overall tone of the text

### 🎯 Domain Detection
- **Sports**: Detects athletic performance data (goals, assists, training metrics)
- **Health**: Identifies fitness and wellness information
- **Productivity**: Recognizes work and task-related data
- **Financial**: Spots monetary and budget information
- **General**: Handles miscellaneous data types

## Example Processing

### Input Text
```
"July 2nd - 2 goals, 2 assists. 7 miles. Left foot needs to be better."
```

### Extracted Data
```json
{
  "metrics": {
    "goals": 2,
    "assists": 2,
    "miles": 7
  },
  "categories": {
    "sports_performance": ["performance_metrics"],
    "health_metrics": ["fitness_tracking"],
    "improvement_areas": ["skill_development"]
  },
  "entities": {
    "body_parts": ["foot"],
    "skills": ["goal", "assist"],
    "activities": ["run"],
    "measurements": ["mile"]
  },
  "sentiment": "neutral",
  "domain": "sports"
}
```

### Generated Insights
1. "Scored 2 goals"
2. "Provided 2 assists"
3. "Ran 7 miles"
4. "Focus area: foot"

### Recommendations
1. "Practice footwork drills to improve technique"
2. "Focus on shooting accuracy in training"

## Technical Architecture

### NLP Processor (`src/lib/nlpProcessor.ts`)
- **AI Integration**: Connects to Ollama for advanced language understanding
- **Pattern Recognition**: Uses regex and linguistic patterns for data extraction
- **Context Analysis**: Understands relationships between different data points
- **Confidence Scoring**: Provides reliability metrics for extracted data

### Text Processor (`src/lib/textProcessor.ts`)
- **Interface Layer**: Provides clean API for text processing
- **Data Validation**: Ensures input quality and length limits
- **Format Conversion**: Transforms NLP results into displayable format

### Upload Integration (`src/app/api/upload/route.ts`)
- **Seamless Processing**: Automatically applies NLP to text inputs
- **Structured Output**: Converts NLP results to table format for display
- **Database Storage**: Saves processed data with metadata

## Setup Instructions

### 1. Install Ollama (Optional - for AI processing)
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama
ollama serve

# Pull Llama 3.1 model
ollama pull llama3.1:8b
```

### 2. Verify Installation
```bash
# Test if Ollama is available
curl http://localhost:11434/api/tags
```

### 3. Test NLP Processing
```bash
# Run the test script
node test-nlp.js
```

## Usage

### Text Input Processing
1. Navigate to the "Make an Entry" page
2. Enter natural language text in the text area
3. Submit the form
4. View the AI-processed results with extracted metrics and insights

### File Upload Processing
1. Upload `.txt` or `.text` files
2. The system automatically applies NLP processing
3. View structured results with domain detection and insights

## Advanced Features

### Fallback Processing
When AI is unavailable, the system uses sophisticated rule-based processing:
- **Pattern Matching**: Recognizes common data patterns
- **Context Inference**: Understands relationships between numbers and words
- **Entity Extraction**: Identifies key concepts and measurements
- **Sentiment Analysis**: Determines emotional tone

### Confidence Scoring
Each extraction includes a confidence score (0-1):
- **High (0.8-1.0)**: Very reliable extraction
- **Medium (0.5-0.8)**: Reasonably reliable
- **Low (0.0-0.5)**: Uncertain extraction

### Domain-Specific Processing
- **Sports**: Focuses on performance metrics, training data, and skill development
- **Health**: Emphasizes fitness tracking, wellness metrics, and health goals
- **Productivity**: Identifies tasks, projects, and work-related metrics
- **Financial**: Extracts monetary values, budgets, and financial goals

## Benefits

### For Users
- **Natural Input**: No need to structure data in specific formats
- **Rich Insights**: Automatic generation of meaningful insights
- **Context Awareness**: System understands the domain and context
- **Actionable Recommendations**: Provides specific improvement suggestions

### For Developers
- **Extensible**: Easy to add new domains and patterns
- **Robust**: Multiple fallback mechanisms ensure reliability
- **Scalable**: Can handle various text formats and lengths
- **Maintainable**: Clean separation of concerns and modular design

## Future Enhancements

### Planned Features
- **Multi-language Support**: Process text in different languages
- **Temporal Analysis**: Understand time-based patterns and trends
- **Advanced Sentiment**: More nuanced emotional analysis
- **Custom Domains**: User-defined domain detection rules
- **Batch Processing**: Handle multiple text inputs simultaneously

### AI Improvements
- **Fine-tuned Models**: Domain-specific AI models for better accuracy
- **Context Memory**: Remember previous inputs for better understanding
- **Learning Capabilities**: Improve extraction based on user feedback
- **Real-time Processing**: Stream processing for live data feeds

## Troubleshooting

### Common Issues

**Ollama Connection Failed**
- Ensure Ollama is running: `ollama serve`
- Check if model is downloaded: `ollama list`
- Verify API endpoint: `curl http://localhost:11434/api/tags`

**Low Confidence Scores**
- Check text quality and clarity
- Ensure sufficient context is provided
- Verify domain-specific keywords are present

**Processing Errors**
- Check server logs for detailed error messages
- Verify text length is within limits (10,000 characters)
- Ensure proper text encoding

### Performance Optimization
- **Model Selection**: Use smaller models for faster processing
- **Caching**: Implement result caching for repeated inputs
- **Batch Processing**: Group multiple inputs for efficiency
- **Async Processing**: Handle long-running operations asynchronously

## Contributing

### Adding New Domains
1. Update `detectDomain()` method in `NLPProcessor`
2. Add domain-specific patterns and keywords
3. Create domain-specific insight generators
4. Add corresponding recommendations

### Improving Extraction
1. Enhance regex patterns in `extractMetrics()`
2. Add new entity types in `extractEntities()`
3. Improve sentiment analysis in `analyzeSentiment()`
4. Update category classification in `categorizeContent()`

### Testing
1. Add test cases to `test-nlp.js`
2. Verify extraction accuracy with various inputs
3. Test fallback processing when AI is unavailable
4. Validate confidence scoring accuracy 