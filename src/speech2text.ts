const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
export const client = new speech.SpeechClient();
export const ttsClient = new textToSpeech.TextToSpeechClient();


export async function transcribe() {
    console.log('transcribe inner')
  // The path to the remote LINEAR16 file
//   const gcsUri = 'https://github.com/rafaelreis-hotmart/Audio-Sample-files/blob/master/sample.wav?raw=true';
  const gcsUri = 'gc://cloud-samples-data/speech/brooklyn_bridge.wav';
  //


  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    uri: gcsUri,
  };


  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };
  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  console.log(`response: ${response}`);
  const transcription = response.results
    .map((result:any) => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  return transcription;
}

export async function transcribe_file() {
    console.log('transcribe inner')
  // The path to the remote LINEAR16 file
//   const gcsUri = 'https://github.com/rafaelreis-hotmart/Audio-Sample-files/blob/master/sample.wav?raw=true';
  const gcsUri = 'gc://cloud-samples-data/speech/brooklyn_bridge.wav';
  //


  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    uri: gcsUri,
  };


  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };
  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  console.log(`response: ${response}`);
  const transcription = response.results
    .map((result:any) => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  return transcription;
}

