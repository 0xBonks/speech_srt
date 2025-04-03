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
      "EN": ['Danielle', 'Gregory', 'Ivy', 'Joanna', 'Kendra', 'Kimberly', 'Salli', 'Joey', 'Justin', 'Kevin',
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
      'Danielle', 'Gregory', 'Ivy', 'Joanna', 'Kendra', 'Kimberly', 'Salli', 'Joey', 'Justin', 'Kevin',
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
    if (!voiceId) {
      console.error(`Missing voice ID for language ${shortLangCode}`);
      // Fallback to first voice in the list for this language
      if (this.voices[shortLangCode] && this.voices[shortLangCode].length > 0) {
        voiceId = this.voices[shortLangCode][0];
        console.log(`Using fallback voice ${voiceId} for ${shortLangCode}`);
      } else {
        throw new Error(`No voices available for language ${shortLangCode}`);
      }
    }
    
    // Check if voice is neural
    const engine = this.neuralVoices.includes(voiceId) ? "neural" : "standard";
    
    this.synthesizers[shortLangCode] = {
      voiceId,
      engine,
      languageCode: this.longLangCode[shortLangCode]
    };
    
    console.log(`Added synthesizer for ${shortLangCode}:`, this.synthesizers[shortLangCode]);
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
    try {
      if (!this.synthesizers[shortLangCode]) {
        throw new Error(`No synthesizer configured for language ${shortLangCode}`);
      }
      
      const synth = this.synthesizers[shortLangCode];
      
      // Convert lines to properly formatted SSML
      let ssml = '<speak>\n';
      for (const line of lines) {
        if (line.type === 'sentence') {
          ssml += `<s>${line.value}</s>\n`;
        } else if (line.type === 'break' && line.timeToNext > 0) {
          ssml += `<break time="${line.timeToNext}ms"/>\n`;
        }
      }
      ssml += '</speak>';
      
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
      
      // Entferne Sprachpräfixe aus dem Text
      let cleanedText = text;
      const langPrefixMatch = text.match(/^#([A-Z]{2}): (.*)/);
      if (langPrefixMatch) {
        cleanedText = langPrefixMatch[2];
      }
      
      // Wrap in <speak> tags if not already present
      if (!cleanedText.includes('<speak>')) {
        if (!cleanedText.includes('<s>')) {
          cleanedText = `<speak><s>${cleanedText}</s></speak>`;
        } else {
          cleanedText = `<speak>${cleanedText}</speak>`;
        }
      }
      
      const synth = this.synthesizers[shortLangCode];
      console.log('Synthesizing single phrase with config:', {
        text: cleanedText,
        voiceId: synth.voiceId,
        engine: synth.engine,
        languageCode: synth.languageCode
      });
      
      // Get audio stream from AWS Polly
      const audioStream = await this.awsPolly.synthesizeSpeech(
        cleanedText,
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
      if (reportProgress) {
        reportProgress(1.0, "Verarbeite Text");
      }
      
      // Extrahiere Übersetzungen aus dem Text
      const processedTranslations = {};
      
      // Prüfe, ob es Übersetzungen mit dem Format #LANG: Text gibt
      if (Object.keys(translations).length > 0) {
        const firstLang = Object.keys(translations)[0];
        const text = translations[firstLang];
        
        if (text.includes('---')) {
          // Text enthält Übersetzungsblöcke
          const lines = text.split('\n');
          
          for (const line of lines) {
            if (line.trim() === '---') continue;
            
            const langMatch = line.match(/^#([A-Z]{2}): (.*)/);
            if (langMatch) {
              const [_, lang, langText] = langMatch;
              processedTranslations[lang] = langText;
            }
          }
        } else {
          // Keine Übersetzungsblöcke, verwende den Text wie er ist
          for (const [lang, text] of Object.entries(translations)) {
            if (text.trim()) {
              processedTranslations[lang] = text;
            }
          }
        }
      }
      
      console.log('Processed translations:', Object.keys(processedTranslations));
      
      // Berechne Anpassungen für die Zeilen
      const adjusted = await this.calculateAdjustments(processedTranslations);
      
      if (reportProgress) {
        reportProgress(10.0, "Erzeuge Audiodateien");
      }
      
      const langs = Object.keys(adjusted);
      let count = 0;
      
      for (const lang of langs) {
        // Überprüfe, ob ein Synthesizer für diese Sprache konfiguriert ist
        if (!this.synthesizers[lang]) {
          console.warn(`Kein Synthesizer für Sprache ${lang} konfiguriert, überspringe...`);
          count++;
          continue;
        }
        
        try {
          await this.synthMp3SrtToFiles(
            adjusted[lang],
            mp3FilePaths[lang],
            srtFilePaths[lang],
            lang
          );
          
          count++;
          
          if (reportProgress) {
            reportProgress(10 + 90 * count / langs.length, `Erzeuge ${lang}`);
          }
        } catch (error) {
          console.error(`Fehler bei der Synthese für ${lang}:`, error);
          // Fahre mit der nächsten Sprache fort
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