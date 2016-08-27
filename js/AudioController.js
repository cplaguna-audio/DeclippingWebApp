/*
 * ClipAway
 *
 * Copyright (c) 2016 Christopher Laguna
 * https://github.com/cplaguna-audio/ClipAway
 *
 * (MIT License)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of 
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*****************************************************************************\
 *                            AudioController.js                             *
 *                                                                           *
 *  Controller for index.html. Interface between index.html UI and the audio *
 *  analysis and processing.                                                 *
 *                                                                           *
 *****************************************************************************/

function LoadExample() {
  var blob = null;
  var xhr = new XMLHttpRequest(); 
  xhr.open("GET", "resources/audio_examples/1/1_clipped.wav"); 
  xhr.responseType = "blob";
  xhr.onload = function() {
    blob = xhr.response;
    FILE_NAME = "clipping_example.wav";

    var reader = new FileReader();
    reader.onload = function(ev) {
      AUDIO_CONTEXT.decodeAudioData(ev.target.result, function(buffer) {
        INPUT_AUDIO_BUFFER = buffer;
        PROCESSED_AUDIO_BUFFER = CopyAudioBuffer(AUDIO_CONTEXT, INPUT_AUDIO_BUFFER);
        STATE.audio_loaded = true;
        DoDetectClipping();
      });
    };
    reader.readAsArrayBuffer(blob);
    WAVEFORM_INTERACTOR.LoadAudio(blob);
    RefreshIndex();
  }
  xhr.send();
}

function ProcessAudio() {
  console.time('Gain');
  var num_channels = INPUT_AUDIO_BUFFER.numberOfChannels;

  // Start up the progress bar pop-up.
  PROGRESS_BAR_JQUERRY_ELEMENT.w2popup({showClose: false, modal:true});

  UpdateProgressBar(0);
  // Start the audio processing on a separate thread.
  var progress = new Float32Array(num_channels);
  for(channel_idx = 0; channel_idx < num_channels; channel_idx++) {
    progress[channel_idx] = 0;
  }

  if (window.Worker) {
    for(channel_idx = 0; channel_idx < num_channels; channel_idx++) {
      var audio_processing_worker = new Worker("js/Processing/AudioProcessingWorker.js");

      audio_processing_worker.onmessage = function(e) {
        cur_progress = e.data[0];
        the_channel_idx = e.data[1]
        progress[the_channel_idx] = cur_progress;
        if(cur_progress > 1) {
          processed_channel = e.data[2];
          PROCESSED_AUDIO_BUFFER.copyToChannel(processed_channel, the_channel_idx);
          WAVEFORM_INTERACTOR.UpdateProcessedAudio(PROCESSED_AUDIO_BUFFER, function() {});
          min_progress = MyMin(progress);
          if(min_progress > 1) {
            console.timeEnd('Gain');
            w2popup.close();

          }
        }
        else {
          avg_progress = MyAverage(progress);
          UpdateProgressBar(avg_progress);
        }

      };

      params = [INPUT_AUDIO_BUFFER.sampleRate, BLOCK_SIZE, HOP_SIZE];
      audio_processing_worker.postMessage([channel_idx, INPUT_AUDIO_BUFFER.getChannelData(channel_idx), params]);
    }
  }
}

function DoDeclip() {
  DoDeclipShortBursts();
}

function DoDeclipShortBursts() {
  console.time('DeclipShort');
  var num_channels = INPUT_AUDIO_BUFFER.numberOfChannels;

  // Start up the progress bar pop-up.
  var progress_title_element = document.getElementById('progress_title');
  progress_title_element.innerHTML = "Processing Audio";
  PROGRESS_BAR_JQUERRY_ELEMENT.w2popup({showClose: false, modal:true});
  var progress_title_element = document.getElementById('progress_title');
  progress_title_element.innerHTML = "1/3: Declipping Short Bursts";

  UpdateProgressBar(0);

  // Start the audio processing on a separate thread.
  var progress = new Float32Array(num_channels);
  for(channel_idx = 0; channel_idx < num_channels; channel_idx++) {
    progress[channel_idx] = 0;
  }

  if (window.Worker) {
    for(channel_idx = 0; channel_idx < num_channels; channel_idx++) {
      var audio_processing_worker = new Worker("js/Processing/DeclipShortBurstsWorker.js");

      audio_processing_worker.onmessage = function(e) {
        cur_progress = e.data[0];
        the_channel_idx = e.data[1]
        progress[the_channel_idx] = cur_progress;
        if(cur_progress > 1) {
          processed_channel = e.data[2];
          PROCESSED_AUDIO_BUFFER.copyToChannel(processed_channel, the_channel_idx);
          
          var the_callback = function() {};
          min_progress = MyMin(progress);
          console.timeEnd('DeclipShort');

          if(min_progress > 1) {
            the_callback = function() {
              console.log('callback: short declipping');
              // w2popup.close();

              STATE.did_declip_short_bursts = true;
              RefreshIndex();
              DoGetKnownPoints();
            }
          }
          WAVEFORM_INTERACTOR.UpdateProcessedAudio(PROCESSED_AUDIO_BUFFER, the_callback);

        }
        else {
          avg_progress = MyAverage(progress);
          UpdateProgressBar(avg_progress);
        }

      };

      params = [INPUT_AUDIO_BUFFER.sampleRate];
      audio_processing_worker.postMessage([channel_idx, INPUT_AUDIO_BUFFER.getChannelData(channel_idx), SHORT_CLIP_INTERVALS[channel_idx], params]);
    }
  }
}

function DoGetKnownPoints() {  
  console.time('GetKnownPoints');
  var num_channels = INPUT_AUDIO_BUFFER.numberOfChannels;

  KNOWN_POINTS = [];
  for(var channel_idx = 0; channel_idx < num_channels; channel_idx++) {
    KNOWN_POINTS[channel_idx] = [];
  }

  // Start up the progress bar pop-up.
  var progress_title_element = document.getElementById('progress_title');
  progress_title_element.innerHTML = "2/3: Finding Reliable FFT Magnitudes";

  UpdateProgressBar(0);

  // Start the audio processing on a separate thread.
  var progress = new Float32Array(num_channels);
  for(channel_idx = 0; channel_idx < num_channels; channel_idx++) {
    progress[channel_idx] = 0;
  }

  if (window.Worker) {
    for(channel_idx = 0; channel_idx < num_channels; channel_idx++) {
      var audio_processing_worker = new Worker("js/Processing/GetKnownPointsWorker.js");

      audio_processing_worker.onmessage = function(e) {
        cur_progress = e.data[0];
        the_channel_idx = e.data[1]
        progress[the_channel_idx] = cur_progress;
        if(cur_progress > 1) {
          cur_known_points = e.data[2];
          KNOWN_POINTS[the_channel_idx] = cur_known_points;

          min_progress = MyMin(progress);
          if(min_progress > 1) {
            console.timeEnd('GetKnownPoints');
            // w2popup.close();

            STATE.did_get_known_points = true;
            RefreshIndex();
            DoDeclipLongBursts();
          }
        }
        else {
          avg_progress = MyAverage(progress);
          UpdateProgressBar(avg_progress);
        }

      };

      params = [INPUT_AUDIO_BUFFER.sampleRate, BLOCK_SIZE, HOP_SIZE, MIN_FFT_LENGTH];
      audio_processing_worker.postMessage([channel_idx, PROCESSED_AUDIO_BUFFER.getChannelData(channel_idx), LONG_CLIP_INTERVALS[channel_idx], params]);
    }
  }
  
}

function DoDeclipLongBursts() {

  console.time('DeclipLongBursts');
  var num_channels = INPUT_AUDIO_BUFFER.numberOfChannels;

  // Start up the progress bar pop-up.
  var progress_title_element = document.getElementById('progress_title');
  progress_title_element.innerHTML = "3/3: Declipping Long Bursts";
  UpdateProgressBar(0);

  // Start the audio processing on a separate thread.
  var progress = new Float32Array(num_channels);
  for(channel_idx = 0; channel_idx < num_channels; channel_idx++) {
    progress[channel_idx] = 0;
  }

  if (window.Worker) {
    for(channel_idx = 0; channel_idx < num_channels; channel_idx++) {
      var audio_processing_worker = new Worker("js/Processing/DeclipLongBurstsWorker.js");

      audio_processing_worker.onmessage = function(e) {
        cur_progress = e.data[0];
        the_channel_idx = e.data[1]
        progress[the_channel_idx] = cur_progress;
        if(cur_progress > 1) {
          processed_channel = e.data[2];
          PROCESSED_AUDIO_BUFFER.copyToChannel(processed_channel, the_channel_idx);
          min_progress = MyMin(progress);

          var the_callback = function() {};
          if(min_progress > 1) {
            console.timeEnd('DeclipLongBursts');
            the_callback = function() {
              console.log('callback: long declipping.');
              w2popup.close();

              STATE.did_declip_long_bursts = true;
              RefreshIndex();
              };
          }
          WAVEFORM_INTERACTOR.UpdateProcessedAudio(PROCESSED_AUDIO_BUFFER, the_callback);

        }
        else {
          avg_progress = MyAverage(progress);
          UpdateProgressBar(avg_progress);
        }

      };

      params = [INPUT_AUDIO_BUFFER.sampleRate, BLOCK_SIZE, HOP_SIZE];
      audio_processing_worker.postMessage([channel_idx, PROCESSED_AUDIO_BUFFER.getChannelData(channel_idx), LONG_CLIP_INTERVALS[channel_idx], KNOWN_POINTS[channel_idx], params]);
    }
  }
  
}

function DoDetectClipping() {
  if(STATE.audio_loaded) {

    console.time('ClipDetection');
    var num_channels = INPUT_AUDIO_BUFFER.numberOfChannels;
    SHORT_CLIP_INTERVALS = [];
    LONG_CLIP_INTERVALS = [];
    for(var channel_idx = 0; channel_idx < num_channels; channel_idx++) {
      SHORT_CLIP_INTERVALS[channel_idx] = [];
      LONG_CLIP_INTERVALS[channel_idx] = [];
    }

    // Start up the progress bar pop-up.
    PROGRESS_BAR_JQUERRY_ELEMENT.w2popup({showClose: false, modal:true});
    var progress_title_element = document.getElementById('progress_title');
    progress_title_element.innerHTML = "Detecting Clipping";

    UpdateProgressBar(0);

    // Start the audio processing on a separate thread.
    var progress = new Float32Array(num_channels);
    for(channel_idx = 0; channel_idx < num_channels; channel_idx++) {
      progress[channel_idx] = 0;
    }

    if (window.Worker) {
      for(channel_idx = 0; channel_idx < num_channels; channel_idx++) {
        var clipping_detection_worker = new Worker("js/Processing/ClippingDetectionWorker.js");

        clipping_detection_worker.onmessage = function(e) {
          var cur_progress = e.data[0];
          var the_channel_idx = e.data[1]
          progress[the_channel_idx] = cur_progress;
          if(cur_progress > 1) {
            var cur_short_clip_intervals = e.data[2];
            var cur_long_clip_intervals = e.data[3];
            SHORT_CLIP_INTERVALS[the_channel_idx] = cur_short_clip_intervals;
            LONG_CLIP_INTERVALS[the_channel_idx] = cur_long_clip_intervals;

            min_progress = MyMin(progress);
            if(min_progress > 1) {
              console.timeEnd('ClipDetection');
              w2popup.close();

              STATE.did_clipping_detection = true;
              RefreshIndex();
            }
          }
          else {
            avg_progress = MyAverage(progress);
            UpdateProgressBar(avg_progress);
          }

        };

        params = [INPUT_AUDIO_BUFFER.sampleRate];
        clipping_detection_worker.postMessage([channel_idx, INPUT_AUDIO_BUFFER.getChannelData(channel_idx), params]);
      }
    }
  }
  else {
    alert("Load an audio file first.");
  }
}

function UpdateProgressBar(progress) {
  progress_percent = Math.floor(progress * 100);
  progress_element = document.getElementById('progress_bar_progress');
  progress_element.style.width = progress_percent.toString() + '%'; 
  $('#w2ui-popup .w2ui-msg-body').html(PROGRESS_BAR_ELEMENT.innerHTML);
}

function DownloadInputAudio() {
  var wav_blob = AudioBufferToWavBlob(INPUT_AUDIO_BUFFER); 

  var output_file_name = FILE_NAME.substring(0, FILE_NAME.lastIndexOf('.'));

  // Click the link programmatically.
  var download_element = document.getElementById("download_processed_audio");
  var url = window.URL.createObjectURL(wav_blob);
  download_element.href = url;
  download_element.download = "ClipAway-Unprocessed-" + output_file_name + '.wav';
  download_element.click();
  window.URL.revokeObjectURL(url);
}

function DownloadProcessedAudio() {
  var wav_blob = AudioBufferToWavBlob(PROCESSED_AUDIO_BUFFER); 

  // Click the link programmatically.
  var download_element = document.getElementById("download_processed_audio");
  var url = window.URL.createObjectURL(wav_blob);
  download_element.href = url;
  download_element.download = "ClipAway-Declipped-" + FILE_NAME + '.wav';
  download_element.click();
  window.URL.revokeObjectURL(url);
}

// Decide which buttons should be enable/disabled depending on the current
// state.
function RefreshIndex() {
  var file_name_element = document.getElementById("file_name");
  file_name_element.innerHTML = FILE_NAME;

  // 1. Check to allow wavesurfer interaction.
  if(ShouldAllowWaveformInteraction()) {
    WAVEFORM_INTERACTOR.EnableInteraction();

    var toggle_waveform_button = document.getElementById("toggle_waveform_button");
    toggle_waveform_button.removeEventListener('click', ToggleWaveformHandler);
    toggle_waveform_button.addEventListener('click', ToggleWaveformHandler);
    toggle_waveform_button.style.opacity = "1";

    var play_pause_button = document.getElementById("play_pause_button");
    play_pause_button.removeEventListener('click', PlayPauseHandler);
    play_pause_button.addEventListener('click', PlayPauseHandler);
    play_pause_button.style.opacity = "1";

    var play_selection_button = document.getElementById("play_selection_button");
    play_selection_button.removeEventListener('click', PlaySelectionHandler);
    play_selection_button.addEventListener('click', PlaySelectionHandler);
    play_selection_button.style.opacity = "1";

    var zoom_in_button = document.getElementById("zoom_in_button");
    zoom_in_button.removeEventListener('click', ZoomInHandler);
    zoom_in_button.addEventListener('click', ZoomInHandler);
    zoom_in_button.style.opacity = "1";

    var zoom_out_button = document.getElementById("zoom_out_button");
    zoom_out_button.removeEventListener('click', ZoomOutHandler);
    zoom_out_button.addEventListener('click', ZoomOutHandler);
    zoom_out_button.style.opacity = "1";

    var processing_buttons = document.getElementsByClassName("processing_button");
    for(var i = 0; i < processing_buttons.length; i++) {
      processing_buttons[i].style.opacity = "1";
      processing_buttons[i].disabled = false;
    } 

    WAVEFORM_INTERACTOR.original_audio_element.addEventListener('click', function() {
      if(!WAVEFORM_INTERACTOR.original_on) {
        WAVEFORM_INTERACTOR.TurnOnOriginal();
      }
    })

    WAVEFORM_INTERACTOR.processed_audio_element.addEventListener('click', function() {
      if(WAVEFORM_INTERACTOR.original_on) {
        WAVEFORM_INTERACTOR.TurnOnProcessed();
      }
    })
  }
  else {
    WAVEFORM_INTERACTOR.DisableInteraction();

    var toggle_waveform_button = document.getElementById("toggle_waveform_button");
    toggle_waveform_button.style.opacity = "0.2";

    var play_pause_button = document.getElementById("play_pause_button");
    play_pause_button.style.opacity = "0.2";

    var play_selection_button = document.getElementById("play_selection_button");
    play_selection_button.style.opacity = "0.2";

    var zoom_in_button = document.getElementById("zoom_in_button");
    zoom_in_button.removeEventListener('click', ZoomInHandler);
    zoom_in_button.style.opacity = "0.2";

    var zoom_out_button = document.getElementById("zoom_out_button");
    zoom_out_button.removeEventListener('click', ZoomOutHandler);
    zoom_out_button.style.opacity = "0.2";

    var processing_buttons = document.getElementsByClassName("processing_button");
    for(var i = 0; i < processing_buttons.length; i++) {
      processing_buttons[i].style.opacity = "0.2";
      processing_buttons[i].disabled = true;
    } 

  }

/*
  if(ShouldEnableDetectClipping()) {
    var detect_clipping_button = document.getElementById("detect_clipping_button");
    detect_clipping_button.disabled = false;
    detect_clipping_button.style.opacity = "1";
  }
  else {
    var detect_clipping_button = document.getElementById("detect_clipping_button");
    detect_clipping_button.disabled = true;
    detect_clipping_button.style.opacity = "0.2";
  }

  if(ShouldEnableDeclipShortBursts()) {
    var declip_short_bursts_button = document.getElementById("declip_short_bursts_button");
    declip_short_bursts_button.disabled = false;
    declip_short_bursts_button.style.opacity = "1";
  }
  else {
    var declip_short_bursts_button = document.getElementById("declip_short_bursts_button");
    declip_short_bursts_button.disabled = true;
    declip_short_bursts_button.style.opacity = "0.2";
  }

  if(ShouldEnableGetKnownPoints()) {
    var get_known_points_button = document.getElementById("get_known_points_button");
    get_known_points_button.disabled = false;
    get_known_points_button.style.opacity = "1";
  }
  else {
    var get_known_points_button = document.getElementById("get_known_points_button");
    get_known_points_button.disabled = true;
    get_known_points_button.style.opacity = "0.2";
  }

  if(ShouldEnableDeclipLongBursts()) {
    var declip_long_bursts_button = document.getElementById("declip_long_bursts_button");
    declip_long_bursts_button.disabled = false;
    declip_long_bursts_button.style.opacity = "1";
  }
  else {
    var declip_long_bursts_button = document.getElementById("declip_long_bursts_button");
    declip_long_bursts_button.disabled = true;
    declip_long_bursts_button.style.opacity = "0.2";
  }
  */


  // 4. Check remove long bursts button.

}

function FlushIndex() {
  FlushState();

  FILE_NAME = "";
  INPUT_AUDIO_BUFFER = [];
  SHORT_CLIP_INTERVALS = [];
  LONG_CLIP_INTERVALS = [];
  PROCESSED_AUDIO_BUFFER = [];
}

function FlushState() {
  STATE.audio_loaded = false;
  STATE.did_clipping_detection = false;
  STATE.did_declip_short_bursts = false;
  STATE.did_declip_long_bursts = false;
}

function ShouldAllowWaveformInteraction() {
  return STATE.audio_loaded;
}

function ShouldEnableDetectClipping() {
  return STATE.audio_loaded;
}

function ShouldEnableDeclipShortBursts() {
  return STATE.audio_loaded && STATE.did_clipping_detection;
}

function ShouldEnableGetKnownPoints() {
  return STATE.audio_loaded && STATE.did_clipping_detection && STATE.did_declip_short_bursts;
}

function ShouldEnableDeclipLongBursts() {
  return STATE.audio_loaded && STATE.did_clipping_detection && STATE.did_declip_short_bursts && STATE.did_get_known_points;
}

// Button handlers.
function ToggleWaveformHandler(event) {
  WAVEFORM_INTERACTOR.ToggleActiveWaveSurfer();
}

function PlayPauseHandler(event) {
  WAVEFORM_INTERACTOR.PlayPausePressed();
}

function PlaySelectionHandler(event) {
  WAVEFORM_INTERACTOR.PlayRegion();
}

function ZoomInHandler(event) {
  WAVEFORM_INTERACTOR.ZoomIn();
}

function ZoomOutHandler(event) {
  WAVEFORM_INTERACTOR.ZoomOut();
}