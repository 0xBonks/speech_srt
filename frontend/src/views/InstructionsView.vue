<template>
  <div class="instructions-container">
    <h1>SSML Tags Guide</h1>
    
    <div class="instruction-section">
      <h2>What is SSML?</h2>
      <p>
        SSML (Speech Synthesis Markup Language) is an XML-based markup language
        that allows you to control pronunciation, intonation, and other aspects of synthesized
        speech. With SSML tags, you can precisely customize the speech output of Amazon Polly.
      </p>
    </div>
    
    <div class="instruction-section">
      <h2>Basic SSML Tags</h2>
      <div class="tag-table">
        <table>
          <thead>
            <tr>
              <th>Tag</th>
              <th>Description</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>&lt;s&gt;...&lt;/s&gt;</code></td>
              <td>Defines a sentence. Creates a longer pause at the end.</td>
              <td><code>&lt;s&gt;This is a sentence.&lt;/s&gt;</code></td>
            </tr>
            <tr>
              <td><code>&lt;break&gt;</code></td>
              <td>Inserts a pause. Attributes: time (e.g., "500ms", "1s") or strength (e.g., "medium", "strong").</td>
              <td><code>Here is a pause &lt;break time="1s"/&gt; of one second.</code></td>
            </tr>
            <tr>
              <td><code>&lt;emphasis&gt;...&lt;/emphasis&gt;</code></td>
              <td>Emphasizes text. Attributes: level (e.g., "strong", "moderate", "reduced").</td>
              <td><code>&lt;emphasis level="strong"&gt;Important&lt;/emphasis&gt; point.</code></td>
            </tr>
            <tr>
              <td><code>&lt;prosody&gt;...&lt;/prosody&gt;</code></td>
              <td>Controls pitch, volume, and speaking rate. Attributes: rate, pitch, volume.</td>
              <td><code>&lt;prosody rate="slow" pitch="high"&gt;Slow and high.&lt;/prosody&gt;</code></td>
            </tr>
            <tr>
              <td><code>&lt;say-as&gt;...&lt;/say-as&gt;</code></td>
              <td>Indicates how text should be interpreted. Attributes: interpret-as (e.g., "date", "number", "telephone").</td>
              <td><code>&lt;say-as interpret-as="telephone"&gt;+1-212-555-0123&lt;/say-as&gt;</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="instruction-section">
      <h2>Advanced SSML Tags</h2>
      <div class="tag-table">
        <table>
          <thead>
            <tr>
              <th>Tag</th>
              <th>Description</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>&lt;phoneme&gt;...&lt;/phoneme&gt;</code></td>
              <td>Defines phonetic pronunciation. Attributes: alphabet (e.g., "ipa"), ph (phonetic representation).</td>
              <td><code>&lt;phoneme alphabet="ipa" ph="təˈmeɪtoʊ"&gt;tomato&lt;/phoneme&gt;</code></td>
            </tr>
            <tr>
              <td><code>&lt;sub&gt;...&lt;/sub&gt;</code></td>
              <td>Substitutes text with another for pronunciation. Attributes: alias.</td>
              <td><code>&lt;sub alias="World Wide Web Consortium"&gt;W3C&lt;/sub&gt;</code></td>
            </tr>
            <tr>
              <td><code>&lt;amazon:effect&gt;...&lt;/amazon:effect&gt;</code></td>
              <td>Amazon Polly-specific effects. Attributes: name (e.g., "whispered").</td>
              <td><code>&lt;amazon:effect name="whispered"&gt;Whispered text&lt;/amazon:effect&gt;</code></td>
            </tr>
            <tr>
              <td><code>&lt;mark&gt;</code></td>
              <td>Sets a marker in the audio stream. Attributes: name.</td>
              <td><code>&lt;mark name="Chapter1"/&gt;Chapter 1 begins here.</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="instruction-section">
      <h2>Usage Tips</h2>
      <ul>
        <li>
          <strong>Structure sentences:</strong> Use <code>&lt;s&gt;</code> tags to clearly separate sentences and create natural pauses.
        </li>
        <li>
          <strong>Insert pauses:</strong> With <code>&lt;break&gt;</code> tags, you can control the speaking pace and highlight important information.
        </li>
        <li>
          <strong>Improve pronunciation:</strong> Use <code>&lt;phoneme&gt;</code> or <code>&lt;sub&gt;</code> for difficult words or abbreviations.
        </li>
        <li>
          <strong>Add emotion:</strong> With <code>&lt;prosody&gt;</code> and <code>&lt;emphasis&gt;</code>, you can add more expression to the speech.
        </li>
        <li>
          <strong>Numbers and dates:</strong> Use <code>&lt;say-as&gt;</code> to ensure that numbers, dates, and other special formats are read correctly.
        </li>
      </ul>
    </div>
    
    <div class="instruction-section">
      <h2>Example of Formatted Text</h2>
      <pre class="code-example">
&lt;speak&gt;
  &lt;s&gt;Welcome to our voiceover application.&lt;/s&gt;
  &lt;s&gt;With SSML tags, you can precisely control the &lt;emphasis level="strong"&gt;pronunciation&lt;/emphasis&gt;.&lt;/s&gt;
  &lt;break time="500ms"/&gt;
  &lt;prosody rate="slow"&gt;Here I speak more slowly.&lt;/prosody&gt;
  &lt;prosody pitch="high"&gt;And here with a higher pitch.&lt;/prosody&gt;
  &lt;s&gt;Call us at &lt;say-as interpret-as="telephone"&gt;+1-212-555-0123&lt;/say-as&gt;.&lt;/s&gt;
  &lt;s&gt;Or visit us on &lt;say-as interpret-as="date" format="mdy"&gt;04/15/2025&lt;/say-as&gt;.&lt;/s&gt;
&lt;/speak&gt;
      </pre>
    </div>
    
    <div class="instruction-section">
      <h2>Notes</h2>
      <p>
        If you don't use SSML tags, our application will automatically split the text into sentences.
        However, for more precise control over speech output, we recommend using SSML tags,
        especially <code>&lt;s&gt;</code> tags for sentence structuring.
      </p>
      <p>
        Not all voices support all SSML features equally. Support may vary depending on
        language and voice.
      </p>
    </div>
  </div>
</template>

<script setup>
// Keine zusätzliche Logik erforderlich
</script>

<style scoped>
.instructions-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

h1 {
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

.instruction-section {
  margin-bottom: 40px;
}

h2 {
  color: #444;
  margin-bottom: 15px;
  border-left: 4px solid #007bff;
  padding-left: 10px;
}

p {
  line-height: 1.6;
  color: #555;
}

.tag-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

th, td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  color: #d63384;
}

.code-example {
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 5px;
  padding: 15px;
  overflow-x: auto;
  font-family: monospace;
  line-height: 1.5;
  white-space: pre-wrap;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 10px;
  line-height: 1.5;
}

strong {
  font-weight: bold;
  color: #333;
}
</style>
