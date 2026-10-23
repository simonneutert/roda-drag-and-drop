const dropZone = document.getElementById("drop-zone");
const preview = document.getElementById("preview");
const fileInput = document.getElementById("file-input");
const folderInput = document.getElementById("folder-input");
const chooseFilesBtn = document.getElementById("choose-files-btn");
const chooseFolderBtn = document.getElementById("choose-folder-btn");
const clearBtn = document.getElementById("clear-btn");
const uploadForm = document.getElementById("upload-form");

let selectedFiles = [];

function hasFileItems(dataTransfer) {
  return Boolean(
    dataTransfer?.items && [...dataTransfer.items].some((item) => item.kind === "file"),
  );
}

function setDropZoneActive(active) {
  dropZone.classList.toggle("drag-active", active);
}

function syncFileInput() {
  const dataTransfer = new DataTransfer();
  for (const file of selectedFiles) {
    dataTransfer.items.add(file);
  }
  fileInput.files = dataTransfer.files;
}

function renderQueue() {
  preview.textContent = "";

  for (const file of selectedFiles) {
    const li = document.createElement("li");
    li.textContent = file.webkitRelativePath || file.name;
    preview.appendChild(li);
  }
}

function addFiles(files) {
  const nextFiles = [...files].filter((file) => file instanceof File);
  if (nextFiles.length === 0) {
    return;
  }

  selectedFiles = [...selectedFiles, ...nextFiles];
  renderQueue();
  syncFileInput();
}

function collectFilesFromEntry(entry) {
  return new Promise((resolve, reject) => {
    if (entry.isFile) {
      entry.file((file) => resolve([file]), reject);
      return;
    }

    if (entry.isDirectory) {
      const reader = entry.createReader();
      reader.readEntries(async (entries) => {
        try {
          const files = [];
          for (const childEntry of entries) {
            files.push(...(await collectFilesFromEntry(childEntry)));
          }
          resolve(files);
        } catch (error) {
          reject(error);
        }
      }, reject);
      return;
    }

    resolve([]);
  });
}

async function handleDroppedItems(dataTransfer) {
  const files = [];

  for (const file of [...(dataTransfer?.files || [])]) {
    if (file instanceof File) {
      files.push(file);
    }
  }

  if (files.length > 0) {
    addFiles(files);
    return;
  }

  const items = [...(dataTransfer?.items || [])];

  for (const item of items) {
    if (item.kind !== "file") {
      continue;
    }

    const entry = item.webkitGetAsEntry?.();
    if (entry) {
      files.push(...(await collectFilesFromEntry(entry)));
    } else {
      const file = item.getAsFile?.();
      if (file) {
        files.push(file);
      }
    }
  }

  if (files.length > 0) {
    addFiles(files);
  }
}

dropZone.addEventListener("dragenter", (event) => {
  if (hasFileItems(event.dataTransfer)) {
    event.preventDefault();
    setDropZoneActive(true);
  }
});

dropZone.addEventListener("dragover", (event) => {
  if (hasFileItems(event.dataTransfer)) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDropZoneActive(true);
  }
});

dropZone.addEventListener("dragleave", (event) => {
  if (!dropZone.contains(event.relatedTarget)) {
    setDropZoneActive(false);
  }
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  setDropZoneActive(false);
  handleDroppedItems(event.dataTransfer);
});

window.addEventListener("dragover", (event) => {
  if (hasFileItems(event.dataTransfer)) {
    event.preventDefault();
  }
});

window.addEventListener("drop", (event) => {
  if (hasFileItems(event.dataTransfer)) {
    event.preventDefault();
  }
});

chooseFilesBtn.addEventListener("click", () => {
  fileInput.click();
});

chooseFolderBtn.addEventListener("click", () => {
  folderInput.click();
});

function handlePickerChange(event) {
  addFiles(event.target.files);
  event.target.value = "";
}

fileInput.addEventListener("change", handlePickerChange);
folderInput.addEventListener("change", handlePickerChange);

clearBtn.addEventListener("click", () => {
  selectedFiles = [];
  renderQueue();
  fileInput.value = "";
  folderInput.value = "";
  syncFileInput();
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (selectedFiles.length === 0) {
    return;
  }

  const formData = new FormData();
  for (const file of selectedFiles) {
    formData.append("files[]", file, file.name);
  }

  try {
    const response = await fetch(uploadForm.action, {
      method: uploadForm.method,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    if (data.redirect) {
      window.location.href = data.redirect;
      return;
    }

    alert("Upload complete");
  } catch (error) {
    console.error(error);
    alert("Upload failed");
  }
});
