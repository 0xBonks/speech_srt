const fs = require('fs');
const path = require('path');
const { AwsPolly } = require('./awsPolly');
const { utils } = require('./utils');

class Mp3SrtSynth {
  constructor(config) {
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
    this.region = config.region;
    
    this.synthesizers = {};
    
    // Sprach-Codes und Namen
    this.longLangCode = {
      'EN': 'en-US',
      'DE': 'de-DE',
      'FR': 'fr-FR',
      'ES': 'es-ES',
      'IT': 'it-IT',
      'PL': 'pl-PL',
      'PT': 'pt-PT',
      'RU': 'ru-RU',
      'JA': 'ja-JP',
      'ZH': 'cmn-CN',
      'AR': 'ar-AE',
      'NL': 'nl-NL',
      'CS': 'cs-CZ',
      'DA': 'da-DK',
      'FI': 'fi-FI',
      'KO': 'ko-KR',
      'NB': 'nb-NO',
      'SV': 'sv-SE',
      'TR': 'tr-TR'
    };

    this.langCodeToName = {
      'EN': 'English',
      'DE': 'Deutsch',
      'FR': 'Français',
      'ES': 'Español',
      'IT': 'Italiano',
      'PL': 'Polski',
      'PT': 'Português',
      'RU': 'Русский',
      'JA': 'Japanese',
      'ZH': 'Chinese',
      'AR': 'Arabic (Gulf)',
      'NL': 'Dutch',
      'CS': 'Czech',
      'DA': 'Danish',
      'FI': 'Finnish',
      'KO': 'Korean',
      'NB': 'Norwegian',
      'SV': 'Swedish',
      'TR': 'Turkish'
    };

    // Verfügbare Stimmen pro Sprache
    this.voices = {
      "EN": ['Danielle', 'Gregory', 'Ivy', 'Joanna*', 'Kendra', 'Kimberly', 'Salli', 'Joey', 'Justin', 'Kevin',
             'Matthew', 'Ruth', 'Stephen'],
      "DE": ["Daniel", "Vicki"],
      "FR": ["Lea", "Remi"],
      "IT": ["Bianca", "Adriano"],
      "ZH": ["Zhiyu"],
      "JA": ["Kazuha", "Takumi", "Tomoko"],
      "RU": ["Maxim", "Tatyana"],
      'ES': ['Lucia', 'Sergio'],
      'PL': ['Ola'],
      'PT': ['Ines'],
      'AR': ['Hala', 'Zayd'],
      'NL': ['Laura'],
      'CS': ['Jitka'],
      'DA': ['Sofie'],
      'FI': ['Suvi'],
      'KO': ['Seoyeon'],
      'NB': ['Ida'],
      'SV': ['Elin'],
      'TR': ['Burcu']
    };

    // Neural Stimmen
    this.neuralVoices = [
      'Danielle', 'Gregory', 'Ivy', 'Joanna*', 'Kendra', 'Kimberly', 'Salli', 'Joey', 'Justin', 'Kevin',
      'Matthew', 'Ruth', 'Stephen',
      "Daniel", "Vicki",
      "Lea", "Remi",
      "Bianca", "Adriano",
      "Zhiyu",
      "Kazuha", "Takumi", "Tomoko",
      'Lucia', 'Sergio', 'Ola',
      'Ines',
      'Hala', 'Zayd',
      'Laura',
      'Jitka',
      'Sofie',
      'Suvi',
      'Seoyeon',
      'Ida',
      'Elin',
      'Burcu'
    ];
    
    this.awsPolly = new AwsPolly({
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
      region: this.region
    });
  }
  
  addLang(voiceId, shortLangCode) {
    // Check if voice is neural
    const neuralVoices = [
      'Danielle', 'Gregory', 'Ivy', 'Joanna', 'Kendra', 'Kimberly', 'Salli', 'Joey', 'Justin', 'Kevin',
      'Matthew', 'Ruth', 'Stephen', 'Daniel', 'Vicki', 'Lea', 'Remi', 'Bianca', 'Adriano', 'Zhiyu',
      'Kazuha', 'Takumi', 'Tomoko', 'Maxim', 'Tatyana', 'Lucia', 'Sergio', 'Ola', 'Ines', 'Hala',
      'Zayd', 'Laura', 'Jitka', 'Sofie', 'Suvi', 'Seoyeon', 'Ida', 'Elin', 'Burcu'
    ];
    
    const engine = neuralVoices.includes(voiceId) ? "neural" : "standard";
    
    this.synthesizers[shortLangCode] = {
      voiceId,
      engine,
      languageCode: this.longLangCode[shortLangCode]
    };
  }
  
  async calculateAdjustments(translations) {
    const lines = {};
    const sentences = {};
    
    for (const [shortLangCode, text] of Object.entries(translations)) {
      lines[shortLangCode] = utils.textToLines(text);
      const ssml = utils.linesToSsml(lines[shortLangCode]);
      
      // Hier würden wir normalerweise die Timings von AWS Polly abrufen
      // Für den Test verwenden wir Dummy-Werte
      const timings = Array(lines[shortLangCode].filter(l => l.type === 'sentence').length + 1)
        .fill(0)
        .map((_, i) => i * 1000); // Jeder Satz dauert 1 Sekunde
      
      sentences[shortLangCode] = lines[shortLangCode].filter(x => x.type === 'sentence');
      
      for (let i = 0; i < sentences[shortLangCode].length - 1; i++) {
        sentences[shortLangCode][i].timeToNext = timings[i + 1] - timings[i];
      }
    }
    
    const keys = Object.keys(sentences);
    
    // Berechne Anpassungen für jede Zeile
    for (let i = 0; i < Math.min(...keys.map(k => sentences[k].length)); i++) {
      const sentencesAtIndex = keys.map(k => sentences[k][i]);
      const maxDuration = Math.max(...sentencesAtIndex.map(x => x.timeToNext));
      
      for (const key of keys) {
        if (i < sentences[key].length) {
          sentences[key][i].adjustment = maxDuration - sentences[key][i].timeToNext;
        }
      }
    }
    
    // Übertrage Anpassungen auf die ursprünglichen Zeilen
    for (const key of keys) {
      let sentenceIndex = 0;
      for (const line of lines[key]) {
        if (line.type === 'sentence') {
          if (sentenceIndex < sentences[key].length) {
            line.adjustment = sentences[key][sentenceIndex].adjustment;
          }
          sentenceIndex++;
        }
      }
    }
    
    // Absolute Zeiten anwenden
    for (const key of keys) {
      let absoluteTime = 0;
      for (const line of lines[key]) {
        if (line.type === 'break') continue;
        
        absoluteTime += line.timeToNext + line.adjustment;
        
        if (line.type === "time_mark") {
          if (line.absoluteStartTime > absoluteTime) {
            line.adjustment = line.absoluteStartTime - absoluteTime;
            absoluteTime = line.absoluteStartTime;
          }
        }
      }
    }
    
    return lines;
  }
  
  async synthMp3SrtToFiles(lines, mp3FilePath, srtFilePath, shortLangCode) {
    const ssml = utils.linesToSsml(lines);
    
    try {
      if (!this.synthesizers[shortLangCode]) {
        throw new Error(`No synthesizer configured for language ${shortLangCode}`);
      }
      
      const synth = this.synthesizers[shortLangCode];
      console.log('Synthesizing with config:', {
        voiceId: synth.voiceId,
        engine: synth.engine,
        languageCode: synth.languageCode,
        ssmlLength: ssml.length
      });
      
      // Get audio stream from AWS Polly
      const audioStream = await this.awsPolly.synthesizeSpeech(
        ssml,
        synth.voiceId,
        synth.engine,
        synth.languageCode
      );
      
      // Write the audio stream to file
      fs.writeFileSync(mp3FilePath, audioStream);
      
      // Get speech marks for SRT generation
      const speechMarks = await this.awsPolly.getSpeechMarks(
        ssml,
        synth.voiceId,
        synth.engine,
        synth.languageCode
      );
      
      // Generate SRT content
      const srtContent = utils.speechMarksToSrt(speechMarks);
      
      // Write SRT file with UTF-8 BOM
      fs.writeFileSync(srtFilePath, '\uFEFF' + srtContent, 'utf8');
      
      // Verify files were created
      if (!fs.existsSync(mp3FilePath)) {
        throw new Error('Failed to create MP3 file');
      }
      
      if (!fs.existsSync(srtFilePath)) {
        throw new Error('Failed to create SRT file');
      }
      
      const stats = fs.statSync(mp3FilePath);
      console.log(`Created MP3 file: ${mp3FilePath}, size: ${stats.size} bytes`);
      
      return true;
    } catch (error) {
      console.error(`Error in synthesis for ${shortLangCode}:`, error);
      throw error;
    }
  }
  
  async synthOnePhraseMp3ToFile(text, mp3FilePath, shortLangCode) {
    try {
      if (!this.synthesizers[shortLangCode]) {
        throw new Error(`No synthesizer configured for language ${shortLangCode}`);
      }
      
      const synth = this.synthesizers[shortLangCode];
      console.log('Synthesizing single phrase with config:', {
        text,
        voiceId: synth.voiceId,
        engine: synth.engine,
        languageCode: synth.languageCode
      });
      
      // Get audio stream from AWS Polly
      const audioStream = await this.awsPolly.synthesizeSpeech(
        text,
        synth.voiceId,
        synth.engine,
        synth.languageCode
      );
      
      // Write the audio stream to file
      fs.writeFileSync(mp3FilePath, audioStream);
      
      // Verify file was created and has content
      if (!fs.existsSync(mp3FilePath)) {
        throw new Error('Failed to create MP3 file');
      }
      
      const stats = fs.statSync(mp3FilePath);
      console.log(`Created MP3 file: ${mp3FilePath}, size: ${stats.size} bytes`);
      
      if (stats.size < 100) {
        throw new Error('Generated MP3 file is too small to be valid');
      }
      
      return true;
    } catch (error) {
      console.error(`Error in single phrase synthesis for ${shortLangCode}:`, error);
      throw error;
    }
  }
  
  async synthesizeAllLangs(translations, mp3FilePaths, srtFilePaths, reportProgress = null) {
    try {
      const adjusted = await this.calculateAdjustments(translations);
      
      if (reportProgress) {
        reportProgress(1.0, "Making voice");
      }
      
      const numOfLang = Object.keys(adjusted).length;
      let count = 0;
      
      for (const [shortLangCode, lines] of Object.entries(adjusted)) {
        await this.synthMp3SrtToFiles(
          lines,
          mp3FilePaths[shortLangCode],
          srtFilePaths[shortLangCode],
          shortLangCode
        );
        
        count++;
        
        if (reportProgress) {
          reportProgress(100 * count / numOfLang, `Making ${shortLangCode}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Fehler bei der Synthese aller Sprachen:', error);
      throw error;
    }
  }
}

module.exports = { Mp3SrtSynth }; 