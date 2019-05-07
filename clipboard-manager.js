const { clipboard, app } = require('electron');
const path = require('path');
const fs = require('fs');

const userDataPath = app.getPath('userData');
const historyFilePath = path.join(userDataPath, "history.json");

let clipboardHistory = [];

if (fs.existsSync(historyFilePath)) {
  const rawClipboardHistory = fs.readFileSync(historyFilePath);
  clipboardHistory = clipboardHistory.concat(JSON.parse(rawClipboardHistory));
}

function writeHistoryToFile() {
  fs.writeFileSync(historyFilePath, JSON.stringify(clipboardHistory));
}

let processing = false;

function lastData() {
  return clipboardHistory.length > 0
    ? clipboardHistory[0]
    : null;
}

function getHistory() {
  return clipboardHistory;
}

module.exports.create = function createClipboardManager(onChange, onError) {
  const initialData = clipboard.readText();
  if (initialData) {
    clipboardHistory.unshift(initialData);
    writeHistoryToFile();
  }

  const interval = setInterval(() => {
    if (processing) { return; }
    processing = true;
    try {
      const currentData = clipboard.readText();
      if (currentData && currentData !== lastData()) {
        clipboardHistory.unshift(currentData);
        writeHistoryToFile();
        onChange && onChange(currentData);
      }
    } catch (error) {
      onError && onError(error);
    } finally {
      processing = false;
    }
  }, 500);

  return {
    getHistory,
    stop() {
      clearInterval(interval);
    },
  };
};
