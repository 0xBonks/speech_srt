const AWS = require('aws-sdk');

class AwsPolly {
  constructor(config) {
    if (!config.accessKeyId || !config.secretAccessKey) {
      throw new Error('AWS credentials are required');
    }
    
    this.polly = new AWS.Polly({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region || 'eu-west-1'
    });
  }
  
  async synthesizeSpeech(text, voiceId, engine = 'standard', languageCode = 'en-US') {
    try {
      console.log('AWS Polly synthesizing speech with params:', {
        voiceId,
        engine,
        languageCode,
        textLength: text.length
      });

      // Ensure text is properly wrapped in SSML if not already
      let ssmlText = text;
      if (!ssmlText.includes('<speak>')) {
        ssmlText = `<speak>${ssmlText}</speak>`;
      }

      const params = {
        OutputFormat: 'mp3',
        Text: ssmlText,
        TextType: 'ssml',
        VoiceId: voiceId,
        Engine: engine,
        LanguageCode: languageCode,
        SampleRate: '22050'
      };
      
      console.log('Sending request to AWS Polly with SSML:', ssmlText);
      const response = await this.polly.synthesizeSpeech(params).promise();
      
      if (!response.AudioStream) {
        throw new Error('No AudioStream in AWS Polly response');
      }
      
      console.log('AWS Polly synthesis successful, audio size:', response.AudioStream.length, 'bytes');
      return response.AudioStream;
    } catch (error) {
      console.error('AWS Polly synthesis error:', error);
      if (error.code === 'CredentialsError') {
        throw new Error('Invalid AWS credentials');
      } else if (error.code === 'InvalidSampleRateException') {
        throw new Error('Invalid sample rate');
      } else if (error.code === 'InvalidSsmlException') {
        throw new Error(`Invalid SSML request: ${error.message}. Text was: ${text}`);
      } else if (error.code === 'MissingRequiredParameter') {
        throw new Error(`Missing required parameter: ${error.message}`);
      } else {
        throw error;
      }
    }
  }
  
  async getSpeechMarks(text, voiceId, engine = 'standard', languageCode = 'en-US') {
    try {
      // Ensure text is properly wrapped in SSML if not already
      let ssmlText = text;
      if (!ssmlText.includes('<speak>')) {
        ssmlText = `<speak>${ssmlText}</speak>`;
      }
      
      const params = {
        OutputFormat: 'json',
        Text: ssmlText,
        TextType: 'ssml',
        VoiceId: voiceId,
        Engine: engine,
        LanguageCode: languageCode,
        SpeechMarkTypes: ['sentence', 'ssml']
      };
      
      console.log('Sending request for speech marks to AWS Polly');
      const response = await this.polly.synthesizeSpeech(params).promise();
      
      if (!response.AudioStream) {
        throw new Error('No AudioStream in AWS Polly response for speech marks');
      }
      
      const markData = response.AudioStream.toString().split('\n');
      const parsedMarks = markData
        .filter(line => line.trim() !== '')
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            console.error('Error parsing speech mark:', line, e);
            return null;
          }
        })
        .filter(mark => mark !== null);
      
      console.log(`Received ${parsedMarks.length} speech marks from AWS Polly`);
      return parsedMarks;
    } catch (error) {
      console.error('Error getting speech marks:', error);
      if (error.code === 'CredentialsError') {
        throw new Error('Invalid AWS credentials');
      } else if (error.code === 'InvalidSsmlException') {
        throw new Error(`Invalid SSML request for speech marks: ${error.message}. Text was: ${text}`);
      } else if (error.code === 'MissingRequiredParameter') {
        throw new Error(`Missing required parameter for speech marks: ${error.message}`);
      } else {
        throw error;
      }
    }
  }
}

module.exports = { AwsPolly }; 