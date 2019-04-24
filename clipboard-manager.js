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
    ? clipboardHistory[clipboardHistory.length - 1]
    : null;
}

function getHistory() {
  return clipboardHistory;
}

module.exports.create = function createClipboardManager(onCopy, onError) {
  const initialData = clipboard.readText();
  if (initialData) {
    clipboardHistory.push(initialData);
    writeHistoryToFile();
  }

  const interval = setInterval(() => {
    if (processing) { return; }
    processing = true;
    try {
      const currentData = clipboard.readText();
      if (currentData && currentData !== lastData()) {
        clipboardHistory.push(currentData);
        writeHistoryToFile();
        onCopy && onCopy(currentData);
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
