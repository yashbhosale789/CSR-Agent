sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
  "use strict";
  var ignore_onend;
  var final_transcript = "";
  var recognizing = false;
  var start_timestamp;
  var recognition;
  var entryNumber = 0;
  return Controller.extend(
    "com.mindset.sapawareaiassistantnew.controller.Chat", {
      onInit: function () {
        this.getView().setModel(new JSONModel(), "viewModel");
        this.getView()
          .getModel("viewModel")
          .setProperty("/EntryCollection", []);
        var that = this;

        if (
          !("webkitSpeechRecognition" in window) &&
          !("SpeechRecognition" in window)
        ) {
          console.log("Upgrade your browser for speech recognition !");
        } else {
          recognition =
            new webkitSpeechRecognition() || new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;

          recognition.onstart = function () {
            console.log("Start recognition");
          };

          recognition.onerror = function (event) {
            if (event.error == "no-speech") {
              console.log(
                "No speech was detected ! Please check your microphone ?"
              );
              ignore_onend = true;
            }
            if (event.error == "audio-capture") {
              console.log("No microphone was found.");
              ignore_onend = true;
            }
            if (event.error == "not-allowed") {
              if (event.timeStamp - start_timestamp < 100) {
                console.log("Permission to use microphone is blocked !");
              } else {
                console.log("Permission to use microphone was denied !");
              }
              ignore_onend = true;
            }
          };

          recognition.onend = function () {
            recognizing = false;
            if (ignore_onend) {
              return;
            }
            if (!final_transcript) {
              console.log("Start speaking !");
              return;
            }
          };

          recognition.onresult = function (event) {
            var interim_transcript = "";
            for (var i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
              } else {
                interim_transcript += event.results[i][0].transcript;
              }
            }
            final_transcript = final_transcript;
            if (final_transcript !== "") {
              that.onPost({
                getParameter: function (parameter) {
                  return this.parameters[parameter];
                },
                parameters: {
                  value: final_transcript,
                },
              });
              console.log("Final : ", final_transcript);
            }

            console.log("Interim :", interim_transcript);
          };

          recognition.addEventListener("speechend", () => {
            console.log("Speech has stopped being detected");
          });
        }
      },

      onPost: function (event) {
        const chatText = event.getParameter("value");
        const entryCollection = this.getView()
          .getModel("viewModel")
          .getProperty("/EntryCollection");
        entryCollection.push({
          Author: "Speaker",
          Type: "Reply",
          Date: new Date().toLocaleString(),
          Text: chatText,
          Count: entryNumber,
        });
        entryNumber = entryNumber + 1;
        this.getView()
          .getModel("viewModel")
          .setProperty("/EntryCollection", entryCollection);

        const responses = this.getView().byId("_IDGenVBox1").getItems();
        responses[responses.length - 1]
          .getObjectBinding()
          .setParameter("transcript", chatText)
          .execute();
      },

      onRecognition: function (event) {
        if (recognizing) {
          recognition.stop();
          return;
        }
        final_transcript = "";
        recognition.start();
        recognizing = true;
        ignore_onend = false;
        start_timestamp = event.timeStamp;
      },
    }
  );
});