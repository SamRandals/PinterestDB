"use strict"

// control y form
let db;
function openDB(){
    return new Promise((resolve, reject) => {
           const DBRequest = indexedDB.open("Pinterest", 1);
    DBRequest.onupgradeneeded=()=>{
        db = DBRequest.result;
        if(!db.objectStoreNames.contains("Pin")){
            db.createObjectStore("Pin",{
                keyPath:"id",
                autoIncrement:true
            })
        }
        console.log("se creo la base de datos")
    }

    DBRequest.onsuccess=()=>{
        db= DBRequest.result
        resolve(db.result);
    }

    DBRequest.onerror=()=>{
        db= DBRequest.result
        reject(db.result)
    }
    });
 

}
async function startDB(){

    try{
        await openDB();
    }
    catch(e){
        console.log("error al iniciar la base de datos")
    }
}

startDB();


function addPin(Pin){
    return new Promise((resolve, reject) => {
         if(!Pin){
        console.log("No se ha publicado un pin");
    }

    const trans = db.transaction("Pin","readwrite");
    const objt = trans.objectStore("Pin");
    const request = objt.add(Pin);
    
    request.onsuccess=()=>{
        resolve(request)
    }
    request.error=()=>{
        reject("error al subir datos en la base de datos")
    }

    });
}

async function readPin(){
    
    await startDB();
        
     const trans = db.transaction("Pin","readonly");
    const objt = trans.objectStore("Pin");
    const request = objt.openCursor();

    const contentMenu = document.querySelector(".content__menu");

    contentMenu.innerHTML=""  

        const viewPins = document.createElement("div");
        viewPins.classList.add("view__pin");

    request.onsuccess=async(e)=>{
        let cursor= e.target.result;
        if(cursor){
            let  {img, title, desc }= cursor.value;
           
          
            //
              const wrapper = document.createElement("div");
                wrapper.classList.add("wrapper__pin");

             wrapper.innerHTML = `
                <div class="pin__image-container">
                    <img src="${img}">
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

        }else {
            // ✅ Al terminar el cursor, añade el contenedor global
            contentMenu.appendChild(viewPins);
        }
        
    }
        
    ;
}

const homeButton= document.querySelector(".home-button");
    homeButton.addEventListener("click",()=>[
        readPin()
    ])

window.addEventListener("DOMContentLoaded", readPin());




const publishButton = document.querySelector(".publish-button")


publishButton.addEventListener("click",(e)=>{

const contentMenu= document.querySelector(".content__menu");

// definimos un div nuevo
const form__container = document.createElement("div");
form__container.classList.add("form__container");

contentMenu.innerHTML="";

form__container.innerHTML=`

<div class="header__publish">
    <h2>Crear Pin</h2>
    <button id="publish">Publicar</button>
</div>

<form class="form__publish">

    <div class="drop-img">

        <div class="container__img">

        </div>

    </div>


    <div class="form__items">

        <label for="title" class="">Titulo</label>

        <input type="text" class="" id="title">


        <label for="desc" class="">Descripcion</label>

        <input type="text" class="" id="desc">


        <label for="link" class="">Enlace</label>

        <input type="text" class="" id="link">


        <label for="tablero" class="">Tablero</label>

        <input type="text" class="" id="tablero">


        <label for="tag" class="">etiquetados</label>

        <input type="text" class="" id="tag">


    </div>


</form>

`
contentMenu.appendChild(form__container);



setDropZone();
setPublishButton();
})

let base64image="";
function setDropZone(){
    const container__img = document.querySelector(".container__img");
    if(container__img){

        
        container__img.addEventListener("dragover",(e)=>{
            e.preventDefault();
            changeColorDragDrop("#BEE4DD");

        })

        
        container__img.addEventListener("dragleave",(e)=>{
            e.preventDefault()
            changeColorDragDrop("#E0E0D9");
        })


        container__img.addEventListener("drop",(e)=>{
            e.preventDefault()
            changeColorDragDrop("#fff");

            const file =  e.dataTransfer.files[0];
            const reader= new FileReader();
            
            reader.onload=(e)=>{
                base64image= e.target.result;
                container__img.style.backgroundImage=`url("${base64image}")`
                container__img.style.backgroundSize="auto 100%"
                container__img.style.backgroundPosition="center"
                container__img.style.backgroundRepeat="no-repeat"

            }
            reader.readAsDataURL(file);
            
            
        })


    }

}


function changeColorDragDrop(background){
    const container__img = document.querySelector(".container__img");
    if(container__img){
        container__img.style.background = background;
    }
}


async function setPublishButton(){
    try{
        const publish = document.getElementById("publish")
        
        publish.addEventListener("click",async()=>{
                 
    const container__img = document.querySelector(".container__img")

    if(publish && container__img){
            
             const img= base64image
            const title = document.getElementById("title").value;
            const desc = document.getElementById("desc").value;
            const link = document.getElementById("link").value;
            const tablero = document.getElementById("tablero").value;
            const tag = document.getElementById("tag").value;

            
            const newPin={

                img,
                title,
                desc,
                link,
                tablero,
                tag
            }
            
            await startDB();
           showToast("🟩 Guardado correctamente!");
            await addPin(newPin);
            
           

    }
        })
    }
    catch(e){
        console.log(e)
       showToast("🟥Ocurrio un error al guardar tus datos");
    }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000); // se oculta después de 3s
}
