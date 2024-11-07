// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getAuth, signInAnonymously, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";
import { getFirestore, doc, addDoc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCTRHMSngXyt-PYUIV3kdGtrJOel5SWPf4",
    authDomain: "invitacionjb.firebaseapp.com",
    projectId: "invitacionjb",
    storageBucket: "invitacionjb.appspot.com",
    messagingSenderId: "877651846620",
    appId: "1:877651846620:web:a9ba35cc7f9a08d0909b19",
    measurementId: "G-MVSHF14Y1W"
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const storage = getStorage();
const db = getFirestore(firebaseApp);
const storageRef = ref(storage);
const listRef = ref(storage, 'images/');
//const docRef = doc(db, "confirmaciones", "RA9m40BozxZVyHjnlpfA");


function handleFileSelect(evt) {
    $("#preloader").removeClass("hideLoader");
    $("#preloader").addClass("showLoader");
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];
    var metadata = {
    'contentType': file.type
    };

    // Push to child path.
    const imagesRef = ref(storageRef, 'images/');
    const fileRef = ref(imagesRef, file.name);
    uploadBytes(fileRef, file).then(function(snapshot) {
        console.log('Uploaded', snapshot.totalBytes, 'bytes.');
        console.log('File metadata:', snapshot.metadata);
        $("#preloader").removeClass("showLoader");
        $("#preloader").addClass("hideLoader");
        Swal.fire('Foto Guardada');
        document.getElementById('imageFile').value="";
        // Let's get a download URL for the file.
        // getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        //     console.log('File available at', downloadURL);
        //     document.getElementById('linkbox').innerHTML = '<a href="' +  downloadURL + '">Click For File</a>';
        // });
    }).catch(function(error) {
        console.error('Upload failed:', error);
        $("#preloader").removeClass("showLoader");
        $("#preloader").addClass("hideLoader");
        Swal.fire('Ha ocurrido un error al cargar la foto');
    });
}

$("#subirfoto").on('click', function(){
    $("#imageFile").css('display', 'block');
});
$("#imageFile").on('change', function(){
    document.getElementById('imageFile').addEventListener('change', handleFileSelect, false);
    document.getElementById('imageFile').disabled = true;

    auth.onAuthStateChanged(function(user) {
        if (user) {
            // console.log('Anonymous user signed-in.', user);
            document.getElementById('imageFile').disabled = false;
        } else {
            console.log('No hubo ninguna sesión anónima. Creando un nuevo usuario anónimo.');
            // Sign the user in anonymously since accessing Storage requires the user to be authorized.
            signInAnonymously(auth).catch((error) => {
            if (error.code === 'auth/operation-not-allowed') {
                window.alert('Anonymous Sign-in failed. Please make sure that you have enabled anonymous ' +
                    'sign-in on your Firebase project.');
            }
            });
        }
    });
});


window.onload = async () => {
    if(window.navigator.userAgentData.mobile == false){
        $(".container").css("display","none");
        $(".oculto").css("display","block");
    } else{
        $(".container").load('/views/invitacion.html');
    }
}

$("#btnConfirma").on('click', async function(){
    $("#preloader").removeClass("hideLoader");
    $("#preloader").addClass("showLoader");
    var asiste;
    if ($("#nombre").val() != '') {
        if ($("#flexRadioDefault1").is(':checked') == true) {
            asiste='si';
        } else if ($("#flexRadioDefault2").is(':checked') == true) {
            asiste='no';
        }
    } else {

    }
    const docRef = await addDoc(collection(db, "confirmaciones"), {
        asistencia: asiste,
        nombre: $("#nombre").val(),
        mensaje: $('#message').val(), 
    });
    if(asiste =='si'){
        Swal.fire(`${$("#nombre").val()} has confirmado tu asistencia`,'¡Preparate para el gran día!', 'success');
        $("#nombre").val('');
        $("#message").val('');
    } else {
        Swal.fire(`Gracias por tu respuesta ${$("#nombre").val()}`,'', 'success');
    }
    $("#preloader").removeClass("showLoader");
    $("#preloader").addClass("hideLoader");
});

$("#verfotos").on('click', function(){
    $("#preloader").removeClass("hideLoader");
    $("#preloader").addClass("showLoader");
    var downloadURL='';
    $("#containerFotos").empty();
    listAll(listRef)
    .then((res) => {
        if(res.items.length > 0){
            res.prefixes.forEach((folderRef) => {
                console.log(folderRef);
            });
            res.items.forEach((itemRef) => {
                const starsRef= ref(storage, `gs://${itemRef.bucket}/${itemRef.fullPath}`);
                getDownloadURL(starsRef)
                .then((url) => {
                    var afotos ='';
                    afotos = `<a href="${url}" target="_blank"><img class="foto" src="${url}"></a>`;
                    $("#popupFoto>img").attr("src",url);
                    $("#containerFotos").append(afotos);
                })
                .catch((error) => {    
                    console.log(error);
                    $("#preloader").removeClass("showLoader");
                    $("#preloader").addClass("hideLoader");
                });
                $("#staticBackdrop").modal('show');
                $("#preloader").removeClass("showLoader");
                $("#preloader").addClass("hideLoader");
            });
        }else{
            $("#preloader").removeClass("showLoader");
            $("#preloader").addClass("hideLoader");
            Swal.fire('No se han agregado fotos al album #WeddingBetyJosue','','warning');
        }
    }).catch((error) => {
        console.log(error);
        $("#preloader").removeClass("showLoader");
        $("#preloader").addClass("hideLoader");
        Swal.fire('Ha ocurrido un error al cargar el album');
    });
});

//Obtener todos los documentos de la coleccion
$("#vwlogin").ready(async function (){
    var template='';
    var contador=0;
    const querySnapshot = await getDocs(collection(db, "confirmaciones"));
    querySnapshot.forEach((doc) => {
        contador += 1;
        template+=`<tr>
            <td>${contador}</td>
            <td>${doc.data().nombre}</td>
            <td>${doc.data().asistencia}</td>
            <td>${doc.data().mensaje}</td>
        </tr>`;
    });
    $("#tbodylist").html(template);    
});

//Obtener un documento
// const docSnap = await getDoc(docRef);
// if(docSnap.exists) {
//     console.log("Document data:", docSnap.data());
// } else {
//     // doc.data() will be undefined in this case
//     Swal.fire({
//         icon: 'error',
//         title: 'Oops...',
//         text: 'No existe tal documento'
//     })
// }
