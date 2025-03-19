const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const process = require('process');
const { translation, workers, utils } = require('./utils');
const { Mp3SrtSynth } = require('./Mp3SrtSynth');
const { Translation } = require('./translation');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

// Serve static files
app.use(express.static('static'));

// Environment variables
const appEnv = {
  tempFileFolder: process.env.TEMP_FILE_FOLDER || 'output',
  tempPlayFolder: process.env.TEMP_PLAY_FOLDER || path.join('static', 'temp'),
  pollyKeyId: process.env.POLLY_KEY_ID,
  pollySecretKey: process.env.POLLY_SECRET_KEY,
  pollyRegion: process.env.POLLY_REGION || 'eu-west-1',
  translatorKey: process.env.TRANSLATOR_API_KEY_FREE_DEEPL,
  translatorUrl: process.env.TRANSLATOR_URL_FREE_DEEPL,
  ignoreTranslatorSslCert: process.env.IGNORE_TRANSLATOR_SSL_CERT === '1'
};

// Ensure directories exist
if (!fs.existsSync(appEnv.tempFileFolder)) {
  fs.mkdirSync(appEnv.tempFileFolder, { recursive: true });
}

if (!fs.existsSync(appEnv.tempPlayFolder)) {
  fs.mkdirSync(appEnv.tempPlayFolder, { recursive: true });
}

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../static/index.html'));
});

// API Routes
app.get('/api/status', (req, res) => {
  const hideSecrets = { ...appEnv };
  
  if (hideSecrets.pollySecretKey) {
    const secretKey = hideSecrets.pollySecretKey;
    hideSecrets.pollySecretKey = secretKey.substring(0, 4) + '*'.repeat(secretKey.length - 8) + secretKey.substring(secretKey.length - 4);
  }
  
  if (hideSecrets.translatorKey) {
    const secretKey = hideSecrets.translatorKey;
    hideSecrets.translatorKey = secretKey.substring(0, 4) + '*'.repeat(secretKey.length - 8) + secretKey.substring(secretKey.length - 4);
  }
  
  if (hideSecrets.pollyKeyId) {
    const secretKey = hideSecrets.pollyKeyId;
    hideSecrets.pollyKeyId = secretKey.substring(0, 4) + '*'.repeat(secretKey.length - 8) + secretKey.substring(secretKey.length - 4);
  }
  
  hideSecrets["abspath for temp_file_folder"] = path.resolve(hideSecrets.tempFileFolder);
  hideSecrets["Access to temp_file_folder"] = checkFolderAccess(hideSecrets.tempFileFolder);
  hideSecrets["abspath for temp_play_folder"] = path.resolve(hideSecrets.tempPlayFolder);
  hideSecrets["Access to temp_play_folder"] = checkFolderAccess(hideSecrets.tempPlayFolder);
  
  res.json({ environ: hideSecrets, aws_polly_test_result: "", translator_test_result: "" });
});

// Test AWS Polly
app.post('/api/test-polly', async (req, res) => {
  try {
    const mp3SrtSynth = new Mp3SrtSynth({
      accessKeyId: appEnv.pollyKeyId,
      secretAccessKey: appEnv.pollySecretKey,
      region: appEnv.pollyRegion
    });
    
    mp3SrtSynth.addLang('Joanna', 'EN');
    const testFilePath = path.join(appEnv.tempFileFolder, 'test.mp3');
    
    console.log('Testing AWS Polly with test phrase...');
    await mp3SrtSynth.synthOnePhraseMp3ToFile('<s>Hello World</s>', testFilePath, 'EN');
    
    if (fs.existsSync(testFilePath)) {
      const stats = fs.statSync(testFilePath);
      console.log(`Test file created with size: ${stats.size} bytes`);
      
      if (stats.size < 100) { // Eine echte MP3-Datei sollte größer sein
        throw new Error('Generated audio file is too small, likely empty or invalid');
      }
      
      fs.unlinkSync(testFilePath);
      res.json({ result: "Connection Successful - Audio generated" });
    } else {
      throw new Error('Test file was not created');
    }
  } catch (e) {
    console.error('AWS Polly test error:', e);
    res.json({ result: `Exception: ${e.message}` });
  }
});

// Test Translator
app.post('/api/test-translator', async (req, res) => {
  try {
    const translator = new Translation(
      appEnv.translatorUrl,
      appEnv.translatorKey,
      !appEnv.ignoreTranslatorSslCert
    );
    
    const result = await translator.translateText("Hi", "DE", "EN");
    res.json({ result: `Success: Hi -> ${result}` });
  } catch (e) {
    res.json({ result: `Error: ${e.message}` });
  }
});

// Download route
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const downloadName = req.query.name || 'result.zip';
  
  utils.deleteOldFiles(appEnv.tempFileFolder, ['.mp3', '.txt', '.zip', '.srt'], 600);
  
  const filePath = path.join(appEnv.tempFileFolder, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.download(filePath, downloadName);
});

// Play route
app.get('/api/play/:filename', (req, res) => {
  const filename = req.params.filename;
  
  utils.deleteOldFiles(appEnv.tempPlayFolder, ['.mp3'], 600);
  
  const filePath = path.join(appEnv.tempPlayFolder, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Set proper headers for audio streaming
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.setHeader('Accept-Ranges', 'bytes');

  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  // Handle errors
  fileStream.on('error', (error) => {
    console.error('Error streaming audio file:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error streaming audio file' });
    }
  });
});

// Play current line
app.post('/api/play-line', async (req, res) => {
  try {
    const { text, cursorPosition, voices, origLang } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    console.log('Play line request:', { 
      textLength: text.length, 
      cursorPosition, 
      voices, 
      origLang 
    });
    
    let lineText = text;
    
    // Wenn der Text direkt übergeben wird (bei Übersetzungsauswahl)
    if (cursorPosition === 0 && text.length > 0) {
      lineText = text;
    } else {
      // Sonst extrahiere die Zeile an der Cursor-Position
      lineText = utils.getLineByPos(text, cursorPosition);
      console.log('Text line to synthesize:', lineText);
      
      if (!lineText) {
        return res.status(400).json({ error: 'No line found at cursor position' });
      }
    }
    
    // Entferne Sprachpräfixe wie "#DE: " oder "#EN: " aus dem Text
    const langPrefixMatch = lineText.match(/^#([A-Z]{2}): (.*)/);
    if (langPrefixMatch) {
      lineText = langPrefixMatch[2];
    }
    
    console.log('Cleaned text for synthesis:', lineText);
    
    // Überprüfe, ob die Stimme für die Sprache existiert
    if (!voices[origLang]) {
      return res.status(400).json({ error: `No voice selected for language ${origLang}` });
    }
    
    const hash = crypto.createHash('sha256').update(lineText + voices[origLang]).digest('hex');
    const tempFilePath = path.join(appEnv.tempPlayFolder, `${hash}.mp3`);
    
    if (!fs.existsSync(tempFilePath)) {
      console.log('Creating new MP3 file with AWS Polly...');
      const mp3SrtSynth = new Mp3SrtSynth({
        accessKeyId: appEnv.pollyKeyId,
        secretAccessKey: appEnv.pollySecretKey,
        region: appEnv.pollyRegion
      });
      
      mp3SrtSynth.addLang(voices[origLang], origLang);
      await mp3SrtSynth.synthOnePhraseMp3ToFile(`<s>${lineText}</s>`, tempFilePath, origLang);
      
      // Check if file was created and has content
      if (fs.existsSync(tempFilePath)) {
        const stats = fs.statSync(tempFilePath);
        console.log('Generated MP3 file size:', stats.size, 'bytes');
        if (stats.size === 0) {
          throw new Error('Generated MP3 file is empty');
        }
      } else {
        throw new Error('MP3 file was not created');
      }
    } else {
      console.log('Using existing MP3 file');
      const stats = fs.statSync(tempFilePath);
      console.log('Existing MP3 file size:', stats.size, 'bytes');
    }
    
    // Send the file path instead of base64 data
    res.json({ file_name_mp3: path.basename(tempFilePath) });
  } catch (error) {
    console.error('Error playing line:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add translation
app.post('/api/add-translation', async (req, res) => {
  try {
    const { text, targetLang, origLang } = req.body;

    if (!text || !targetLang || !origLang) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    console.log('Translation request:', { 
      targetLang, 
      origLang, 
      textLength: text.length,
      textStart: text.substring(0, 50) + (text.length > 50 ? '...' : '')
    });

    const workerId = uuidv4();
    workers[workerId] = {
      status: 'started',
      progress: 0,
      stage: 'Initializing translation',
      result: null
    };

    (async () => {
      try {
        const translator = new Translation(
          appEnv.translatorUrl,
          appEnv.translatorKey,
          !appEnv.ignoreTranslatorSslCert
        );

        // Split text into lines and prepare for translation
        let translatedText = '';
        let originalText = '';

        // If text already contains translations (has ---)
        if (text.includes('---')) {
          console.log('Text already contains translations');
          const parts = text.split('---');
          if (parts.length >= 2) {
            const lines = parts[1].trim().split('\n');
            translatedText = '---\n';
            
            // Sammle alle vorhandenen Übersetzungen
            const existingTranslations = new Map();
            
            for (const line of lines) {
              const match = line.match(/^#([A-Z]{2}): (.*)/);
              if (match) {
                const langCode = match[1];
                const langText = match[2].trim();
                existingTranslations.set(langCode, langText);
                
                // Wenn es die Originalsprache ist, merken wir uns den Text
                if (langCode === origLang) {
                  originalText = langText;
                }
              }
            }
            
            console.log('Existing translations:', Array.from(existingTranslations.keys()));
            
            // Füge alle bestehenden Übersetzungen hinzu (außer der neuen Zielsprache)
            for (const [langCode, langText] of existingTranslations.entries()) {
              if (langCode !== targetLang) {
                translatedText += `#${langCode}: ${langText}\n`;
              }
            }
          } else {
            console.error('Invalid text format - missing content after ---');
            throw new Error('Invalid text format');
          }
        } else {
          // This is the first translation, use the input text as original
          console.log('First translation, using input as original');
          originalText = text;
          translatedText = '---\n';
          translatedText += `#${origLang}: ${originalText}\n`;
        }

        // Ensure we have a text to translate
        if (!originalText) {
          console.error('No original text found for language', origLang);
          throw new Error(`No text found for source language ${origLang}`);
        }

        console.log('Text to translate:', { 
          originalText: originalText.substring(0, 50) + (originalText.length > 50 ? '...' : ''),
          fromLang: origLang,
          toLang: targetLang
        });

        // Perform the translation
        workers[workerId].stage = 'Translating';
        workers[workerId].progress = 50;
        
        const translatedLine = await translator.translateText(originalText, targetLang, origLang);
        translatedText += `#${targetLang}: ${translatedLine}`;

        workers[workerId].progress = 100;
        workers[workerId].stage = 'Translation completed';
        workers[workerId].status = 'completed';
        workers[workerId].result = { text: translatedText };
        
        console.log('Translation completed, result contains', 
          translatedText.split('\n').filter(line => line.match(/^#[A-Z]{2}:/)).length, 
          'languages');
      } catch (error) {
        console.error('Translation error:', error);
        workers[workerId].status = 'completed';
        workers[workerId].result = { error: error.message };
      }
    })();

    res.json({ workerId });
  } catch (error) {
    console.error('Error in add-translation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create MP3/SRT files
app.post('/api/make-files', async (req, res) => {
  try {
    const { text, voices, origLang } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    console.log('Make files request:', { 
      textStart: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      voices: Object.keys(voices),
      origLang
    });
    
    const workerId = uuidv4();
    
    workers[workerId] = {
      status: 'started',
      progress: 0,
      stage: 'Initializing',
      result: null
    };
    
    (async () => {
      try {
        const mp3SrtSynth = new Mp3SrtSynth({
          accessKeyId: appEnv.pollyKeyId,
          secretAccessKey: appEnv.pollySecretKey,
          region: appEnv.pollyRegion
        });
        
        // Füge alle Stimmen zum Synthesizer hinzu
        const langs = Object.keys(voices);
        for (const lang of langs) {
          mp3SrtSynth.addLang(voices[lang], lang);
          console.log(`Added synthesizer for ${lang}: ${voices[lang]}`);
        }
        
        // Extrahiere die Übersetzungen aus dem Text
        const translations = {};
        
        // Prüfe, ob der Text das Format mit --- hat
        if (text.includes('---')) {
          const parts = text.split('---');
          if (parts.length >= 2) {
            const contentPart = parts[1].trim();
            const lines = contentPart.split('\n');
            
            // Sammle alle Sprachübersetzungen
            for (const lang of langs) {
              const langPrefix = `#${lang}:`;
              const langLines = [];
              
              for (const line of lines) {
                if (line.startsWith(langPrefix)) {
                  const translatedText = line.substring(langPrefix.length).trim();
                  langLines.push(translatedText);
                }
              }
              
              if (langLines.length > 0) {
                translations[lang] = langLines.join('\n');
                console.log(`Found translation for ${lang}, length: ${translations[lang].length} chars`);
              } else {
                console.warn(`No translation found for language ${lang}`);
              }
            }
          }
        } else {
          // Fallback: Nimm den ganzen Text für die Originalsprache
          translations[origLang] = text;
          console.log(`Using entire text for original language ${origLang}`);
        }
        
        // Prüfe, ob Übersetzungen gefunden wurden
        if (Object.keys(translations).length === 0) {
          throw new Error('No translations found in the provided text');
        }
        
        console.log(`Processing ${Object.keys(translations).length} translations: ${Object.keys(translations).join(', ')}`);
        
        // Erstelle Dateipfade für MP3 und SRT
        const uid = uuidv4();
        const mp3FilePaths = {};
        const srtFilePaths = {};
        
        for (const lang in translations) {
          mp3FilePaths[lang] = path.join(appEnv.tempFileFolder, `${uid}_${lang}.mp3`);
          srtFilePaths[lang] = path.join(appEnv.tempFileFolder, `${uid}_${lang}.srt`);
        }
        
        // Generiere Audio und SRT-Dateien
        await mp3SrtSynth.synthesizeAllLangs(
          translations,
          mp3FilePaths,
          srtFilePaths,
          (progress, stage) => {
            workers[workerId].progress = progress;
            workers[workerId].stage = stage;
          }
        );
        
        // Erstelle ZIP-Datei
        const zipFileName = `${uid}.zip`;
        const zipFilePath = path.join(appEnv.tempFileFolder, zipFileName);
        
        const filesToZip = [...Object.values(mp3FilePaths), ...Object.values(srtFilePaths)];
        const zippedFileNames = [
          ...Object.keys(mp3FilePaths).map(lang => `${lang}.mp3`),
          ...Object.keys(srtFilePaths).map(lang => `${lang}.srt`)
        ];
        
        await utils.createZipFile(zipFilePath, filesToZip, zippedFileNames);
        
        // Lösche temporäre Dateien
        for (const filePath of filesToZip) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        
        workers[workerId].progress = 100;
        workers[workerId].stage = 'Complete';
        workers[workerId].status = 'completed';
        workers[workerId].result = { download_file_name: zipFileName };
      } catch (error) {
        console.error('Error creating files:', error);
        workers[workerId].status = 'completed';
        workers[workerId].result = { error: error.message };
      }
    })();
    
    res.json({ workerId });
  } catch (error) {
    console.error('Error creating files:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get worker status
app.get('/api/worker/:workerId', (req, res) => {
  const workerId = req.params.workerId;
  
  if (!workers[workerId]) {
    return res.status(404).json({ error: 'Worker not found' });
  }
  
  res.json(workers[workerId]);
});

// Terminate worker
app.delete('/api/worker/:workerId', (req, res) => {
  const workerId = req.params.workerId;
  
  if (!workers[workerId]) {
    return res.status(404).json({ error: 'Worker not found' });
  }
  
  workers[workerId].status = 'terminated';
  
  res.json({ success: true });
});

// Helper function to check folder access
function checkFolderAccess(folderPath) {
  try {
    if (!fs.existsSync(folderPath)) {
      return "Directory does not exist.";
    }
    
    try {
      fs.accessSync(folderPath, fs.constants.R_OK);
      const canRead = true;
      fs.accessSync(folderPath, fs.constants.W_OK);
      const canWrite = true;
      
      if (canRead && canWrite) {
        return "Read Write";
      } else if (canRead) {
        return "Read Only";
      } else if (canWrite) {
        return "Write Only";
      } else {
        return "No Read, No Write";
      }
    } catch (e) {
      return `Error: ${e.message}`;
    }
  } catch (error) {
    return `Error checking access: ${error.message}`;
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 