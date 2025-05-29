"use strict";

let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const DBRequest = indexedDB.open("Pinterest", 1);

    DBRequest.onupgradeneeded = () => {
      db = DBRequest.result;
      if (!db.objectStoreNames.contains("Pin")) {
        db.createObjectStore("Pin", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      console.log("se creo la base de datos");
    };

    DBRequest.onsuccess = () => {
      db = DBRequest.result;
      resolve(db);
    };

    DBRequest.onerror = () => {
      reject("Error al abrir la base de datos");
    };
  });
}

async function startDB() {
  try {
    if (!db) await openDB();
  } catch (e) {
    console.log("Error al iniciar la base de datos");
  }
}

startDB();

function addPin(Pin) {
  return new Promise((resolve, reject) => {
    if (!Pin) {
      console.log("No se ha publicado un pin");
      return;
    }

    const trans = db.transaction("Pin", "readwrite");
    const objt = trans.objectStore("Pin");
    const request = objt.add(Pin);

    request.onsuccess = () => resolve(request);
    request.onerror = () => reject("error al subir datos en la base de datos");
  });
}

async function readPin() {
  await startDB();

  const trans = db.transaction("Pin", "readonly");
  const objt = trans.objectStore("Pin");
  const request = objt.openCursor();

  const contentMenu = document.querySelector(".content__menu");
  contentMenu.innerHTML = "";

  const viewPins = document.createElement("div");
  viewPins.classList.add("view__pin");

  request.onsuccess = async (e) => {
    let cursor = e.target.result;
    if (cursor) {
      let { id, img, title, desc } = cursor.value;

      const wrapper = document.createElement("div");
      wrapper.classList.add("wrapper__pin");

      wrapper.innerHTML = `
        <div class="pin__image-container">
          <img class="pin__image" src="${img}" data-id="${id}">
          <div class="img__hover hidden">
            <div class="menu__hover-header">
              <button class="perfil-button-hover">Perfil</button>    
              <button class="save-button-pin">Guardar</button>    
            </div>
          </div>
        </div>
        <div class="pin__info">
          <h2 class="pin__title">${title}</h2>
          <div class="desc__container-p">
            <p>${desc}</p>
          </div>
        </div>
      `;

      viewPins.appendChild(wrapper);
      cursor.continue();
    } else {
      contentMenu.appendChild(viewPins);
      imageHover();
      viewInfo();
    }
  };
}

const homeButton = document.querySelector(".home-button");
homeButton.addEventListener("click", () => readPin());

window.addEventListener("DOMContentLoaded", readPin);

const publishButton = document.querySelector(".publish-button");

publishButton.addEventListener("click", (e) => {
  const contentMenu = document.querySelector(".content__menu");

  const form__container = document.createElement("div");
  form__container.classList.add("form__container");

  contentMenu.innerHTML = "";

  form__container.innerHTML = `
    <div class="header__publish">
      <h2>Crear Pin</h2>
      <button id="publish">Publicar</button>
    </div>
    <form class="form__publish">
      <div class="drop-img">
        <div class="container__img"></div>
      </div>
      <div class="form__items">
        <label for="title">Titulo</label>
        <input type="text" id="title">
        <label for="desc">Descripcion</label>
        <input type="text" id="desc">
        <label for="link">Enlace</label>
        <input type="text" id="link">
        <label for="tablero">Tablero</label>
        <input type="text" id="tablero">
        <label for="tag">etiquetados</label>
        <input type="text" id="tag">
      </div>
    </form>
  `;
  contentMenu.appendChild(form__container);

  setDropZone();
  setPublishButton();
});

let base64image = "";
function setDropZone() {
  const container__img = document.querySelector(".container__img");
  if (container__img) {
    container__img.addEventListener("dragover", (e) => {
      e.preventDefault();
      changeColorDragDrop("#BEE4DD");
    });

    container__img.addEventListener("dragleave", (e) => {
      e.preventDefault();
      changeColorDragDrop("#E0E0D9");
    });

    container__img.addEventListener("drop", (e) => {
      e.preventDefault();
      changeColorDragDrop("#fff");

      const file = e.dataTransfer.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        base64image = e.target.result;
        container__img.style.backgroundImage = `url("${base64image}")`;
        container__img.style.backgroundSize = "auto 100%";
        container__img.style.backgroundPosition = "center";
        container__img.style.backgroundRepeat = "no-repeat";
      };

      reader.readAsDataURL(file);
    });
  }
}

function changeColorDragDrop(background) {
  const container__img = document.querySelector(".container__img");
  if (container__img) {
    container__img.style.background = background;
  }
}

async function setPublishButton() {
  try {
    const publish = document.getElementById("publish");

    publish.addEventListener("click", async () => {
      const container__img = document.querySelector(".container__img");

      if (publish && container__img) {
        const img = base64image;
        const title = document.getElementById("title").value;
        const desc = document.getElementById("desc").value;
        const link = document.getElementById("link").value;
        const tablero = document.getElementById("tablero").value;
        const tag = document.getElementById("tag").value;

        if (!title) {
          showToast("🟥 Necesitas un titulo!");
          return;
        } else if (!img) {
          showToast("🟥 Necesitas una imagen como minimo!");
          return;
        }

        const newPin = { img, title, desc, link, tablero, tag };
        await startDB();
        await addPin(newPin);
        showToast("🟩 Guardado correctamente!");
        readPin();
      }
    });
  } catch (e) {
    console.log(e);
    showToast("🟥 Ocurrió un error al guardar tus datos");
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function imageHover() {
  const wrappers = document.querySelectorAll(".pin__image-container");

  wrappers.forEach((container) => {
    const hoverElement = container.querySelector(".img__hover");

    container.addEventListener("mouseenter", () => {
      hoverElement.classList.remove("hidden");
      hoverElement.classList.add("appear");
    });

    container.addEventListener("mouseleave", () => {
      hoverElement.classList.add("hidden");
      hoverElement.classList.remove("appear");
    });
  });
}

function viewInfo() {
  try {
    const hoverElements = document.querySelectorAll(".img__hover");

    hoverElements.forEach((hover) => {
      hover.addEventListener("click", async (e) => {
        const imgElement = hover.parentElement.querySelector(".pin__image");
        if (!imgElement) {
          showToast("🟥 Imagen no encontrada");
          return;
        }

        const rawId = imgElement.dataset.id;
        if (!rawId || isNaN(rawId)) {
          showToast("🟥 ID inválido");
          return;
        }

        const pinId = Number(rawId);

        const trans = db.transaction("Pin", "readonly");
        const store = trans.objectStore("Pin");
        const request = store.get(pinId);

        request.onsuccess = async (e) => {
          const pin = e.target.result;

          if (!pin) {
            showToast("🟥 Pin no encontrado");
            return;
          }

          const contentMenu = document.querySelector(".content__menu");
          contentMenu.innerHTML = "";

          const pinView = document.createElement("div");
          pinView.classList.add("main-pin");
          pinView.innerHTML = `
            <div class="img__container-click">
              <img src="${pin.img}" alt="${pin.title}">
            </div>
            <h2>${pin.title}</h2>
            <p>${pin.desc}</p>
            <a href="${pin.link}" target="_blank">${pin.link}</a>
          `;

          const morePins = await seeMorePins();
          contentMenu.appendChild(pinView);
          contentMenu.appendChild(morePins);
          imageHover();
          viewInfo();
        };

        request.onerror = () => {
          showToast("🟥 Error al recuperar el pin");
        };
      });
    });
  } catch (e) {
    console.error("Error en viewInfo:", e);
    showToast("🟥 Error inesperado al mostrar el pin");
  }
}

async function seeMorePins() {
  return new Promise((resolve, reject) => {
    const trans = db.transaction("Pin", "readonly");
    const obj = trans.objectStore("Pin");
    const request = obj.openCursor();

    const container = document.createElement("div");
    container.classList.add("view__pin");

    request.onsuccess = (e) => {
      const cursor = e.target.result;

      if (cursor) {
        const { img, title, desc, id } = cursor.value;

        const wrapper = document.createElement("div");
        wrapper.classList.add("wrapper__pin");

        wrapper.innerHTML = `
          <div class="pin__image-container">
            <img class="pin__image" src="${img}" data-id="${id}">
            <div class="img__hover hidden">
              <div class="menu__hover-header">
                <button class="perfil-button-hover">Perfil</button>    
                <button class="save-button-pin">Guardar</button>    
              </div>
            </div>
          </div>
          <div class="pin__info">
            <h2 class="pin__title">${title}</h2>
            <div class="desc__container-p">
              <p>${desc}</p>
            </div>
          </div>
        `;

        container.appendChild(wrapper);
        cursor.continue();
      } else {
        resolve(container);
      }
    };

    request.onerror = () => {
      reject("Error al cargar más pines");
    };
  });
}
