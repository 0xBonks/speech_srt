const AWS = require('aws-sdk');

class AwsPolly {
  constructor(config) {
    this.polly = new AWS.Polly({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region
    });
  }
  
  async synthesizeSpeech(text, voiceId, engine = 'standard', languageCode = 'en-US') {
    try {
      const params = {
        OutputFormat: 'mp3',
        Text: text,
        TextType: 'ssml',
        VoiceId: voiceId,
        Engine: engine,
        LanguageCode: languageCode
      };
      
      const response = await this.polly.synthesizeSpeech(params).promise();
      return response.AudioStream;
    } catch (error) {
      console.error('Fehler bei der Sprachsynthese:', error);
      throw error;
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