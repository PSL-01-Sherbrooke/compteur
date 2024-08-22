import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { db } from './config.js';

function formatNumber1(num3) {
    return num3.toString().padStart(2, '0');
}

function speakNumber(number) {
    const speech = new SpeechSynthesisUtterance();
    speech.lang = 'fr-FR';
    speech.text = `Numéro : ${number}`;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}

  // Fonction pour mettre à jour l'image en fonction de la valeur du compteur
function updateImage(counterValue) {
    const imgElement = document.getElementById('colorImage');
    
    let imageUrl = '';
    switch (counterValue) {
        case 'G':
            imageUrl = 'https://psl-01-sherbrooke.github.io/compteur/gris.png';
            break;
        case 'R':
            imageUrl = 'https://psl-01-sherbrooke.github.io/compteur/rouge.png';
            break;
        case 'V':
            imageUrl = 'https://psl-01-sherbrooke.github.io/compteur/vert.png';
            break;
        case 'J':
            imageUrl = 'https://psl-01-sherbrooke.github.io/compteur/jaune.png';
            break;
        case 'O':
            imageUrl = 'https://psl-01-sherbrooke.github.io/compteur/orange.png';
            break;
        case 'M':
            imageUrl = 'https://psl-01-sherbrooke.github.io/compteur/mauve.png';
            break;
        case 'B':
            imageUrl = 'https://psl-01-sherbrooke.github.io/compteur/bleu.png';
            break;
        case 'C':
            imageUrl = 'https://psl-01-sherbrooke.github.io/compteur/cyan.png';
            break;
        default:
            imageUrl = ''; // Optionnel : définir une image par défaut ou garder l'image vide
            break;
    }

    imgElement.src = imageUrl;
}

function addColoredCircle(color, oldId) {
  // Crée un nouvel élément <span> pour le cercle
  const circle = document.createElement('span');
  circle.className = 'circle';

  // Définition des couleurs
  const colors = {
    'G': 'gray',
    'R': 'red',
    'V': 'green',
    'J': 'yellow',
    'O': 'orange',
    'M': 'purple',
    'B': 'blue',
    'C': 'lightblue'
  };

  // Applique la couleur en fonction du paramètre
  circle.style.backgroundColor = colors[color] || ''; // Valeur par défaut pour une couleur non définie

  // Trouve l'élément avec l'id spécifié
  const oldElement = document.getElementById(oldId);

  // Vérifie si l'élément existe
  if (oldElement) {
    // Ajoute le cercle après l'élément avec l'id spécifié
    oldElement.parentNode.insertBefore(circle, oldElement.nextSibling);
  } else {
    console.error(`L'élément avec l'id "${oldId}" n'a pas été trouvé.`);
  }
}
function removeColoredCircle(oldId) {
  // Trouve l'élément avec l'id spécifié
  const oldElement = document.getElementById(oldId);

  // Vérifie si l'élément existe
  if (oldElement) {
    // Trouve le cercle à supprimer (le premier <span> avec la classe 'circle' après l'élément)
    const circle = oldElement.nextSibling;
    
    // Vérifie si le cercle existe et s'il a bien la classe 'circle'
    if (circle && circle.classList.contains('circle')) {
      circle.parentNode.removeChild(circle);
    } else {
      console.warn('Aucun cercle à supprimer après l\'élément spécifié.');
    }
  } else {
    console.error(`L'élément avec l'id "${oldId}" n'a pas été trouvé.`);
  }
}

onSnapshot(doc(db, 'waitingRoom', 'current'), (doc) => {
    if (doc.exists) {
        const data = doc.data();
        const currentNumberElement = document.getElementById('currentNumber');
        const currentNumberValue = currentNumberElement.textContent.trim(); // Assure-toi de comparer les valeurs textuelles

            const formattedNumber = formatNumber1(data.number);
                currentNumberElement.textContent = formattedNumber;
                updateImage(data.counter);
                document.getElementById('roomNumber').textContent = data.room;

                const oldNumbers = data.oldNumbers || [];
                for (let i = 0; i < 5; i++) {
                    let tampon = "";
                    tampon = oldNumbers[i] !== undefined ? oldNumbers[i] : '-';
                    if (tampon != '-'){
                        document.getElementById(`old${i + 1}`).textContent = tampon.slice(0, 2);
                        removeColoredCircle(`old${i + 1}`)
                        addColoredCircle(tampon.slice(5, 6),`old${i + 1}`);
                        document.getElementById(`old${i + 1}-2`).textContent = tampon.slice(9, 10);
                    }
                    else {
                        document.getElementById(`old${i + 1}`).textContent = "-";
                        removeColoredCircle(`old${i + 1}`)
                        document.getElementById(`old${i + 1}-2`).textContent = " ";
                    }
                }
                
                const oldTimes = data.oldTimes || [];
                let totalDifference = 0;
                for (let i = 0; i < oldTimes.length - 1; i++) {
                    totalDifference += oldTimes[i] - oldTimes[i + 1];
                }
                const tempsMoyen = oldTimes.length > 1 ? (totalDifference / (oldTimes.length - 1)) / 60000 : 0;
                document.getElementById('tempsMoyen').textContent = tempsMoyen.toFixed(2);

                
                if (data.room != "?") {
                    const notification123 = document.getElementById('notification123');
                    if (notification123) {
                        notification123.volume = 0.5;
                        notification123.play();
                        setTimeout(() => {
                            speakNumber(data.number);
                        }, 2500);
                    }
                }
            }
});
