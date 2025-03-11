const axios = require('axios');

class Translation {
  constructor(url, apiKey, verify = true) {
    this.apiKey = apiKey;
    this.baseUrl = url;
    this.verify = verify;
  }
  
  async translateText(text, targetLang, sourceLang = null) {
    try {
      const params = {
        'auth_key': this.apiKey,
        'text': text,
        'target_lang': targetLang,
        'tag_handling': 'xml'
      };
      
      if (sourceLang) {
        params.source_lang = sourceLang;
      }

      console.log('Sending translation request with params:', {
        url: this.baseUrl,
        targetLang,
        sourceLang,
        textLength: text.length
      });

      const formData = new URLSearchParams(params).toString();
      const response = await axios.post(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        httpsAgent: this.verify ? undefined : new (require('https').Agent)({ rejectUnauthorized: false })
      });
      
      if (response.status === 200 && response.data?.translations?.[0]) {
        const translation = response.data.translations[0].text;
        console.log(`Translation result: "${translation}"`);
        return translation;
      } else {
        console.error('Unexpected API response:', response.data);
        throw new Error(`Translation request failed with status code: ${response.status}`);
      }
    } catch (error) {
      console.error('Error in translation:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = { Translation }; 