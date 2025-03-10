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

      const params = {
        OutputFormat: 'mp3',
        Text: text,
        TextType: 'ssml',
        VoiceId: voiceId,
        Engine: engine,
        LanguageCode: languageCode,
        SampleRate: '22050'  // Explizit Sample Rate setzen
      };
      
      console.log('Sending request to AWS Polly...');
      const response = await this.polly.synthesizeSpeech(params).promise();
      
      if (!response.AudioStream) {
        throw new Error('No AudioStream in AWS Polly response');
      }
      
      if (response.AudioStream.length < 100) { // Eine gültige MP3 sollte größer sein
        throw new Error('AudioStream is too small to be valid MP3');
      }
      
      console.log('AWS Polly synthesis successful, audio size:', response.AudioStream.length, 'bytes');
      return response.AudioStream;
    } catch (error) {
      if (error.code === 'CredentialsError') {
        console.error('AWS Credentials error:', error);
        throw new Error('Invalid AWS credentials');
      } else if (error.code === 'InvalidSampleRateException') {
        console.error('Sample rate error:', error);
        throw new Error('Invalid sample rate');
      } else {
        console.error('AWS Polly synthesis error:', error);
        throw error;
      }
    }
  }
  
  async getSpeechMarks(text, voiceId, engine = 'standard', languageCode = 'en-US') {
    try {
      const params = {
        OutputFormat: 'json',
        Text: text,
        TextType: 'ssml',
        VoiceId: voiceId,
        Engine: engine,
        LanguageCode: languageCode,
        SpeechMarkTypes: ['sentence', 'ssml']
      };
      
      const response = await this.polly.synthesizeSpeech(params).promise();
      const markData = response.AudioStream.toString().split('\n');
      return markData.filter(line => line.trim() !== '').map(line => JSON.parse(line));
    } catch (error) {
      console.error('Fehler beim Abrufen der Sprachmarken:', error);
      throw error;
    }
  }
}

module.exports = { AwsPolly }; 