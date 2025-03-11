const axios = require('axios');
const https = require('https');

class Translation {
  constructor(url, apiKey, verify = true) {
    this.apiKey = apiKey;
    this.baseUrl = url;
    this.verify = verify;
    console.log('Translation instance created with config:', {
      url: this.baseUrl,
      verify: this.verify,
      hasApiKey: !!this.apiKey
    });
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

      console.log('Preparing translation request:', {
        url: this.baseUrl,
        targetLang,
        sourceLang,
        textLength: text.length,
        verifySSL: this.verify
      });

      // Create custom HTTPS agent
      const httpsAgent = this.verify ? undefined : new https.Agent({
        rejectUnauthorized: false
      });

      console.log('Using HTTPS agent with rejectUnauthorized:', httpsAgent ? false : true);

      const formData = new URLSearchParams(params).toString();
      const response = await axios.post(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        httpsAgent: httpsAgent,
        validateStatus: null // Allow any status code for better error handling
      });
      
      console.log('Response received:', {
        status: response.status,
        hasData: !!response.data,
        hasTranslations: !!(response.data?.translations),
        dataType: typeof response.data
      });

      if (response.status === 200 && response.data?.translations?.[0]) {
        const translation = response.data.translations[0].text;
        console.log(`Translation successful: "${translation}"`);
        return translation;
      } else {
        console.error('API Response:', {
          status: response.status,
          data: response.data,
          headers: response.headers
        });
        throw new Error(`Translation request failed with status code: ${response.status}`);
      }
    } catch (error) {
      console.error('Detailed translation error:', {
        message: error.message,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  }
}

module.exports = { Translation }; 