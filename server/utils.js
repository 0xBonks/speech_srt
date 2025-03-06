const fs = require('fs');
const path = require('path');
const axios = require('axios');
const archiver = require('archiver');

// Worker-Speicher
const workers = {};

// Hilfsfunktionen
const utils = {
  // Text in Zeilen aufteilen
  textToLines: (text) => {
    const lines = [];
    const textLines = text.split('\n');
    
    for (const line of textLines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) continue;
      
      if (trimmedLine.startsWith('#')) {
        const value = trimmedLine.substring(1).trim();
        if (/^\d+$/.test(value)) {
          lines.push({ type: 'break', timeToNext: parseInt(value), value: '', adjustment: 0, absoluteStartTime: 0 });
        } else {
          // Zeitmarke verarbeiten
          const timeMs = utils.stringToMs(value);
          if (timeMs !== null) {
            lines.push({ type: 'time_mark', absoluteStartTime: timeMs, value: '', timeToNext: 0, adjustment: 0 });
          }
        }
        continue;
      }
      
      lines.push({ type: 'sentence', value: trimmedLine, timeToNext: 0, adjustment: 0, absoluteStartTime: 0 });
    }
    
    return lines;
  },
  
  // Zeilen zu SSML konvertieren
  linesToSsml: (lines) => {
    let result = '';
    
    for (const line of lines) {
      if (line.type === 'break') {
        result += `<break time="${line.timeToNext}ms"/>\n`;
        continue;
      }
      
      if (line.type === 'time_mark') {
        if (line.adjustment > 0) {
          let adj = line.adjustment - 380;
          if (adj < 0) adj = 0;
          
          while (adj > 10000) {
            result += `<break time="10000ms"/>\n`;
            adj -= 10000;
          }
          
          result += `<break time="${adj}ms"/>\n`;
        }
        continue;
      }
      
      if (line.adjustment > 0) {
        result += `<s>${line.value}<break time="${line.adjustment}ms"/></s>\n`;
      } else {
        result += `<s>${line.value}</s>\n`;
      }
    }
    
    return result;
  },
  
  // String zu Millisekunden konvertieren
  stringToMs: (timeStr) => {
    timeStr = timeStr.trim();
    const sep = ":";
    const parts = timeStr.split(sep);
    
    let h, m, s;
    
    if (parts.length === 3) {
      [h, m, s] = parts;
    } else if (parts.length === 2) {
      [m, s] = parts;
      h = "0";
    } else {
      return null;
    }
    
    s = s.replace(',', '.');
    
    try {
      const sf = parseFloat(s);
      
      if (/^\d+$/.test(h) && /^\d+$/.test(m)) {
        return parseInt(parseInt(h) * 3600000 + parseInt(m) * 60000 + sf * 1000);
      }
    } catch (e) {
      return null;
    }
    
    return null;
  },
  
  // Formatierte Zeit zurückgeben
  formatTime: (deltaMs) => {
    const date = new Date(deltaMs);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
    
    return `${hours}:${minutes}:${seconds},${milliseconds}`;
  },
  
  // Speech Marks zu SRT konvertieren
  speechMarksToSrt: (speechMarks, removeTags = true) => {
    let result = '';
    
    for (let index = 0; index < speechMarks.length; index++) {
      const sm = speechMarks[index];
      if (sm.type !== 'sentence') continue;
      
      const curText = sm.value;
      const curTime = sm.time;
      const nextSentenceStart = index + 1 < speechMarks.length ? speechMarks[index + 1].time : curTime + 60000;
      const endTime = Math.min(nextSentenceStart, curTime + 70 * curText.length);
      
      result += (index + 1) + '\n';
      result += `${utils.formatTime(curTime)} --> ${utils.formatTime(endTime)}\n`;
      const displayText = removeTags ? curText.replace(/<[^>]*>/g, '') : curText;
      result += displayText + '\n\n';
    }
    
    return result;
  },
  
  // XML-Zeichen escapen
  escapeXmlChars: (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  },
  
  // XML-Zeichen unescapen
  unescapeXmlChars: (text) => {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  },
  
  // Zeile anhand der Position im Text finden
  getLineByPos: (text, pos) => {
    const lines = text.split('\n');
    let currentPos = 0;
    
    for (const line of lines) {
      if (currentPos + line.length >= pos) {
        return line;
      } else {
        currentPos += line.length + 1; // +1 für das '\n' Zeichen
      }
    }
    
    return null;
  },
  
  // ZIP-Datei erstellen
  createZipFile: (zipFilePath, filePaths, zippedFileNames) => {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));
      
      archive.pipe(output);
      
      for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        const zippedName = zippedFileNames ? zippedFileNames[i] : path.basename(filePath);
        archive.file(filePath, { name: zippedName });
      }
      
      archive.finalize();
    });
  },
  
  // Alte Dateien löschen
  deleteOldFiles: (directoryPath, extList, ageSeconds) => {
    const currentTime = Date.now();
    
    try {
      const files = fs.readdirSync(directoryPath);
      
      for (const fileName of files) {
        const fileExt = path.extname(fileName);
        const absFilePath = path.join(directoryPath, fileName);
        
        if (fs.statSync(absFilePath).isFile() && extList.includes(fileExt)) {
          const fileModTime = fs.statSync(absFilePath).mtime.getTime();
          
          if (currentTime - fileModTime > ageSeconds * 1000) {
            fs.unlinkSync(absFilePath);
          }
        }
      }
    } catch (error) {
      console.error('Fehler beim Löschen alter Dateien:', error);
    }
  }
};

module.exports = { utils, workers }; 