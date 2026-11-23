const noBtn = document.querySelector("#noBtn");
const windowEl = document.querySelector(".window");
const yesBtn = document.querySelector("#yesBtn");
const title = document.querySelector(".title");
const mailButton = document.querySelector("#mail");
const letterOverlay = document.querySelector("#letterOverlay");
const closeLetterButton = document.querySelector("#closeLetter");
const letter = document.querySelector(".letter");

function dodge() {
    const padding = parseFloat(getComputedStyle(windowEl).paddingLeft);
    const maxLeft = Math.max(
        padding,
        windowEl.clientWidth - noBtn.offsetWidth - padding
    );
    const maxTop = Math.max(
        padding,
        windowEl.clientHeight - noBtn.offsetHeight - padding
    );

    noBtn.style.position = "absolute";
    noBtn.style.left = `${padding + Math.random() * (maxLeft - padding)}px`;
    noBtn.style.top = `${padding + Math.random() * (maxTop - padding)}px`;
}

noBtn.addEventListener("click", dodge);

const dogImage = document.querySelector("#dogImage");
const heartRainSound = document.querySelector("#heartRainSound");
heartRainSound.volume = 0.25;

yesBtn.addEventListener("click", () => {
    playHeartRainSound();
    title.textContent = "YEssssssssss!";
    dogImage.src = "happy-dog.png";
    dogImage.alt = "A happy dog";
    const heartRain = rainHearts();
    heartRain.then(() => {
        window.setTimeout(flyMail, 1000);
    });
});

function playHeartRainSound() {
    heartRainSound.pause();
    heartRainSound.currentTime = 0;
    heartRainSound.play().catch((error) => {
        console.error("Could not play the heart-rain cheer.", error);
    });
}

function rainHearts() {
    const rainLayer = document.createElement("div");
    rainLayer.className = "heart-rain";
    rainLayer.setAttribute("aria-hidden", "true");
    document.body.appendChild(rainLayer);

    return new Promise((resolve) => {
        const heartCount = 200;
        let heartsRemaining = heartCount;
        const hearts = document.createDocumentFragment();

        for (let count = 0; count < heartCount; count += 1) {
            const heart = document.createElement("span");
            const duration = 2.5 + Math.random() * 2;
            const delay = Math.random() * 1.5;
            const spinDuration = 0.8 + Math.random() * 2.2;
            const spinDirection = Math.random() < 0.5 ? -1 : 1;
            const startRotation = Math.random() * 360;
            const turns = duration / spinDuration;

            heart.className = "heart-drop";
            heart.textContent = "❤️";
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.fontSize = `${16 + Math.random() * 24}px`;
            heart.style.animationDuration = `${duration}s`;
            heart.style.animationDelay = `${delay}s`;
            heart.style.setProperty(
                "--drift",
                `${(Math.random() * 2 - 1) * 15}vw`
            );
            heart.style.setProperty("--start-rotation", `${startRotation}deg`);
            heart.style.setProperty(
                "--end-rotation",
                `${startRotation + spinDirection * turns * 360}deg`
            );

            heart.addEventListener("animationend", () => {
                heart.remove();
                heartsRemaining -= 1;
                if (heartsRemaining === 0) {
                    rainLayer.remove();
                    resolve();
                }
            }, { once: true });

            hearts.appendChild(heart);
        }

        rainLayer.appendChild(hearts);
    });
}

function flyMail() {
    const mail = document.getElementById("mail");

    if (!mail) return;

    const maxX = Math.max(0, window.innerWidth - mail.offsetWidth);
    const maxY = Math.max(0, window.innerHeight - mail.offsetHeight);
    const edge = Math.floor(Math.random() * 4);
    let startX;
    let startY;

    if (edge === 0) {
        startX = Math.random() * maxX;
        startY = 0;
    } else if (edge === 1) {
        startX = maxX;
        startY = Math.random() * maxY;
    } else if (edge === 2) {
        startX = Math.random() * maxX;
        startY = maxY;
    } else {
        startX = 0;
        startY = Math.random() * maxY;
    }

    const windowRect = windowEl.getBoundingClientRect();
    const endX = windowRect.right - mail.offsetWidth;
    const endY = windowRect.top;

    mail.classList.remove("mail-arrived");
    mail.style.transition = "none";
    mail.style.transform = `translate(${startX}px, ${startY}px) rotate(0deg)`;
    mail.style.opacity = "1";

    mail.offsetHeight;

    const trailTimer = window.setInterval(() => {
        const ghost = mail.cloneNode(true);
        ghost.removeAttribute("id");
        ghost.className = "mail-trail";
        ghost.style.transition = "opacity 450ms ease-out";
        ghost.style.transform = getComputedStyle(mail).transform;
        ghost.style.opacity = "0.45";

        document.body.appendChild(ghost);

        requestAnimationFrame(() => {
            ghost.style.opacity = "0";
        });

        window.setTimeout(() => ghost.remove(), 450);
    }, 50);

    mail.addEventListener("transitionend", () => {
        window.clearInterval(trailTimer);
    }, { once: true });

    mail.addEventListener("transitionend", (event) => {
        if (event.propertyName === "transform") {
            mail.classList.add("mail-arrived");
        }
    }, { once: true });

    mail.style.transition = "transform 1s ease-out";
    mail.style.transform = `translate(${endX}px, ${endY}px) rotate(1440deg)`;
}

mailButton.addEventListener("click", () => {
    const mailPosition = mailButton.getBoundingClientRect();

    letterOverlay.style.setProperty(
        "--mail-offset-x",
        `${mailPosition.left + mailPosition.width / 2 - window.innerWidth / 2}px`
    );
    letterOverlay.style.setProperty(
        "--mail-offset-y",
        `${mailPosition.top + mailPosition.height / 2 - window.innerHeight / 2}px`
    );

    letterOverlay.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
        letterOverlay.classList.add("is-open");
    });
});

const letterEnvelope = document.querySelector(".letter-envelope");
const letterTextTemplate = document.querySelector("#letterText");

letterEnvelope.addEventListener("click", () => {
    if (letterEnvelope.disabled) return;

    letterTextTemplate.replaceWith(letterTextTemplate.content.cloneNode(true));
    letterEnvelope.disabled = true;
    letterOverlay.classList.add("is-revealing");
    playNextQueuedTrack();
});

function closeLetter() {
    musicPlayer.pause();
    letterOverlay.classList.remove("is-open");
    letterOverlay.classList.remove("is-revealing");
    letterEnvelope.disabled = false;
    letterOverlay.setAttribute("aria-hidden", "true");
    mailButton.focus();
}

closeLetterButton.addEventListener("click", closeLetter);

let letterScrollTimer;
const letterScroll = document.querySelector(".letter-scroll");
const letterPhotoFrames = document.querySelector(".letter-photo-frames");
const photoOverlay = document.querySelector("#photoOverlay");
const expandedPhoto = document.querySelector("#expandedPhoto");
const closePhotoButton = document.querySelector("#closePhoto");
const photoCaption = document.querySelector("#photoCaption");
let activePhotoFrame = null;

function getPhotoCaptionText() {
    return (photoCaption.innerText ?? photoCaption.textContent ?? "")
        .replace(/\r\n?/g, "\n");
}

function saveActivePhotoCaption() {
    if (!activePhotoFrame) return;

    const caption = getPhotoCaptionText();
    activePhotoFrame.dataset.caption = caption;

    try {
        localStorage.setItem(
            `photo-caption:${activePhotoFrame.dataset.photo}`,
            caption
        );
    } catch (error) {
        console.warn("Could not save the photo note.", error);
    }
}

const ourPhotos = [
    "911662388_2223770698353199_9207019283401826295_n.jpg",
    "916447172_1176830945002333_6327452079030254677_n.jpg",
    "916668042_1886137512799671_2909688802107190568_n.jpg",
    "917359032_1833367507779113_4812234518327838541_n.jpg",
    "920227899_1169234168872024_5562541060944918345_n.jpg",
    "920310446_1699883735004895_2147803370425025109_n.jpg",
    "920862397_1687290983028198_3379130985940010593_n.jpg",
    "921181989_1717097120042941_6618939105141407758_n.jpg",
    "921432461_1841934716953385_595043223716513244_n.webp",
    "921668622_981876017930057_632397771500455795_n.jpg",
    "921860987_1700578945009201_511500276503993624_n.jpg",
    "922212410_2281882155730533_2859663509514388270_n.jpg",
    "924600358_1421508019733799_8692005122933523456_n.jpg",
    "925237901_1653120479180918_4763024413270955104_n.jpg",
    "925295549_1041087059008310_1690319693848827638_n.jpg",
    "928071889_1778658516558809_1367767261868935149_n.jpg"
];

ourPhotos.forEach((fileName, index) => {
    const frame = document.createElement("button");
    frame.type = "button";
    frame.className = `letter-photo-frame letter-photo-frame--edge edge-${index + 1}`;
    frame.dataset.photo = `our images/${fileName}`;
    frame.dataset.caption = `Our memory ${index + 1}`;
    frame.setAttribute("aria-label", `Open photo ${index + 1}`);

    const image = document.createElement("img");
    image.src = `our images/${fileName}`;
    image.alt = `Our memory ${index + 1}`;
    frame.appendChild(image);

    frame.addEventListener("click", () => openPhoto(frame));
    letterPhotoFrames.appendChild(frame);
});

function openPhoto(frame) {
    activePhotoFrame = frame;
    expandedPhoto.src = frame.dataset.photo;
    expandedPhoto.alt = frame.querySelector("img").alt;
    let savedCaption = null;
    try {
        savedCaption = localStorage.getItem(`photo-caption:${frame.dataset.photo}`);
    } catch (error) {
        console.warn("Could not load the saved photo note.", error);
    }
    photoCaption.textContent = savedCaption ?? frame.dataset.caption ?? "";
    photoOverlay.setAttribute("aria-hidden", "false");
    photoOverlay.classList.add("is-open");
    window.setTimeout(() => closePhotoButton.focus(), 50);
}

photoCaption.addEventListener("input", () => {
    saveActivePhotoCaption();
});

photoCaption.addEventListener("blur", saveActivePhotoCaption);

window.addEventListener("pagehide", saveActivePhotoCaption);

closePhotoButton.addEventListener("click", () => {
    saveActivePhotoCaption();
    photoOverlay.classList.remove("is-open");
    photoOverlay.setAttribute("aria-hidden", "true");
    expandedPhoto.src = "";
    activePhotoFrame = null;
});

photoOverlay.addEventListener("click", (event) => {
    if (event.target === photoOverlay) {
        closePhotoButton.click();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && photoOverlay.classList.contains("is-open")) {
        closePhotoButton.click();
    }
});

letterScroll.addEventListener("scroll", () => {
    letterScroll.classList.add("is-scrolling");
    window.clearTimeout(letterScrollTimer);
    letterScrollTimer = window.setTimeout(() => {
        letterScroll.classList.remove("is-scrolling");
    }, 700);
}, { passive: true });

const musicDisc = document.querySelector("#musicDisc");
const musicTitle = document.querySelector("#musicTitle");
const musicStatus = document.querySelector("#musicStatus");
const musicPlayer = document.querySelector("#musicPlayer");
const musicFiles = document.querySelector("#musicFiles");
const addMusicButton = document.querySelector("#addMusicButton");
const musicPlaylist = document.querySelector("#musicPlaylist");
const secondsPerTurn = 5;
const seekInstructions =
    "Drag clockwise to fast-forward or counterclockwise to rewind.";

const bundledSongFiles = [
    "A Piece of You.mp3",
    "Adie - Tahanan (Official Lyric Video).mp3",
    "Anything You Want.mp3",
    "Ben&Ben - Araw-Araw Official Lyric Video.mp3",
    "Daniel Caesar - Best Part (Audio) ft. H.E.R.mp3",
    "d4vd - Here With Me (Official Audio).mp3",
    "dwta - Padaba Taka (Lyric Video with Tagalog Translation).mp3",
    "Eliza Maturan - Museo (Official Music Video).mp3",
    "Hindi Ako Mawawala (c) El Manu (Official Lyric Video).mp3",
    "I Won't Give Up.mp3",
    "Ikaw Lang Patutunguhan.mp3",
    "LANY - you! (official video).mp3",
    "Last Night on Earth.mp3",
    "Libu-Libong Buwan (Uuwian) - Kyle Raphael (Lyric Video).mp3",
    "Magnolia.mp3",
    "Make It With You - Ben&Ben (Lyrics).mp3",
    "Moira & Jason - Ikaw At Ako (Lyric Video).mp3",
    "NOBITA - IKAW LANG Official Lyric Video.mp3",
    "NOBITA - UNANG SAYAW (feat. Fayeed Tan) OFFICIAL LYRIC VIDEO.mp3",
    "Nahanap Kita.mp3",
    "New West - Those Eyes (Chapter 1).mp3",
    "Paul Partohap - P.S. I LOVE YOU (Lyric Video).mp3",
    "SUGARCANE - Leonora (Official Lyric Video).mp3",
    "Sa Bawat Sandali - Amiel Sol (Official Music Video).mp3",
    "Secret Door.mp3",
    "THANK YOU 4 LOVIN' ME (Lyric Video).mp3",
    "TJ Monterde - Ikaw at Ako (Lyrics).mp3",
    "TJ Monterde - Mahika - (Official Lyric Video).mp3",
    "Tahanan (c) El Manu [Official Audio].mp3",
    "The 1975 - fallingforyou.mp3",
    "wave to earth - love. (Official Lyric Video).mp3",
    "Yahya - keepyousafe (Lyric Video).mp3",
    "Your Universe.mp3",
    "Zack Tabudlo - Give Me Your Forever (Lyric Video).mp3"
];
let nextTrackId = 0;
const tracks = bundledSongFiles.map((fileName) => ({
    id: nextTrackId++,
    title: fileName.replace(/\.mp3$/i, ""),
    url: encodeURIComponent(fileName)
}));
const secretDoorTrackId = tracks.find((track) => track.title === "Secret Door").id;
let currentTrackId = null;
let shuffledTrackQueue = [];
let lastPlayedTrackId = null;
let previousDiscAngle = 0;
let discRotation = 0;
let draggedDisc = false;
let pendingSeek = 0;

function renderMusicPlaylist() {
    const selectedTrackId = currentTrackId;
    const sortedTracks = [...tracks].sort((first, second) =>
        first.title.localeCompare(second.title, undefined, { sensitivity: "base" })
    );

    musicPlaylist.replaceChildren();
    sortedTracks.forEach((track) => {
        const option = document.createElement("option");
        option.value = String(track.id);
        option.textContent = track.title;
        musicPlaylist.appendChild(option);
    });

    if (selectedTrackId !== null) {
        musicPlaylist.value = String(selectedTrackId);
    }
}

function refillTrackQueue() {
    shuffledTrackQueue = tracks.map((track) => track.id);

    for (let index = shuffledTrackQueue.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffledTrackQueue[index], shuffledTrackQueue[swapIndex]] =
            [shuffledTrackQueue[swapIndex], shuffledTrackQueue[index]];
    }

    if (shuffledTrackQueue.length > 1 &&
        shuffledTrackQueue[0] === lastPlayedTrackId) {
        const swapIndex = 1 + Math.floor(Math.random() * (shuffledTrackQueue.length - 1));
        [shuffledTrackQueue[0], shuffledTrackQueue[swapIndex]] =
            [shuffledTrackQueue[swapIndex], shuffledTrackQueue[0]];
    }
}

function playNextQueuedTrack() {
    if (shuffledTrackQueue.length === 0) {
        refillTrackQueue();
    }

    const trackId = shuffledTrackQueue.shift();
    selectTrack(trackId, true);
    playSelectedTrack();
}

function playSelectedTrack() {
    musicPlayer.play().catch(() => {
        musicStatus.textContent =
            `Could not play ${musicTitle.textContent}. Click the disc to try again.`;
    });
}

renderMusicPlaylist();
selectTrack(secretDoorTrackId);

addMusicButton.addEventListener("click", () => {
    musicFiles.click();
});

musicFiles.addEventListener("change", () => {
    const files = Array.from(musicFiles.files);

    files.forEach((file) => {
        const track = {
            id: nextTrackId++,
            title: file.name.replace(/\.[^.]+$/, ""),
            url: URL.createObjectURL(file)
        };
        tracks.push(track);
        if (shuffledTrackQueue.length > 0) {
            const insertIndex = Math.floor(
                Math.random() * (shuffledTrackQueue.length + 1)
            );
            shuffledTrackQueue.splice(insertIndex, 0, track.id);
        }
    });

    renderMusicPlaylist();
    musicFiles.value = "";
});

musicPlaylist.addEventListener("change", () => {
    const trackId = Number(musicPlaylist.value);
    if (Number.isInteger(trackId) && tracks.some((track) => track.id === trackId)) {
        selectTrack(trackId);
    }
});

function selectTrack(trackId, fromQueue = false) {
    const track = tracks.find((candidate) => candidate.id === trackId);
    if (!track) return;

    if (!fromQueue) {
        shuffledTrackQueue = shuffledTrackQueue.filter((queuedId) => queuedId !== trackId);
    }
    musicPlayer.pause();
    musicPlayer.src = track.url;
    musicPlayer.load();
    currentTrackId = trackId;
    musicPlaylist.value = String(trackId);
    musicTitle.textContent = track.title;
    musicStatus.textContent = seekInstructions;
    musicDisc.disabled = false;
    musicDisc.classList.remove("is-playing", "is-dragging");
    musicDisc.setAttribute("aria-label", `Play ${track.title}`);
    musicDisc.setAttribute("aria-pressed", "false");
    discRotation = 0;
    pendingSeek = 0;
    musicDisc.style.setProperty("--disc-angle", "0deg");
}

musicDisc.addEventListener("click", (event) => {
    if (draggedDisc) {
        draggedDisc = false;
        if (event.detail > 0) return;
    }

    if (musicPlayer.paused) {
        playSelectedTrack();
    } else {
        musicPlayer.pause();
    }
});

function getPointerAngle(event) {
    const bounds = musicDisc.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    return Math.atan2(
        event.clientY - centerY,
        event.clientX - centerX
    ) * 180 / Math.PI;
}

function seekByRotation(angleChange) {
    const seekChange = angleChange / 360 * secondsPerTurn;
    const hasMetadata =
        musicPlayer.readyState >= HTMLMediaElement.HAVE_METADATA &&
        Number.isFinite(musicPlayer.duration);

    if (!hasMetadata) {
        pendingSeek += seekChange;
        musicStatus.textContent = "Seeking will apply when the track loads.";
        return;
    }

    try {
        musicPlayer.currentTime = Math.max(
            0,
            Math.min(
                musicPlayer.duration,
                musicPlayer.currentTime + seekChange
            )
        );
    } catch {
        musicStatus.textContent = "Could not seek this track.";
    }
}

musicDisc.addEventListener("pointerdown", (event) => {
    if (musicDisc.disabled ||
        (event.pointerType === "mouse" && event.button !== 0)) {
        return;
    }

    const matrix = new DOMMatrixReadOnly(
        getComputedStyle(musicDisc).transform
    );
    discRotation = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
    previousDiscAngle = getPointerAngle(event);
    draggedDisc = false;
    musicDisc.classList.add("is-dragging");
    musicDisc.setPointerCapture(event.pointerId);
});

musicDisc.addEventListener("pointermove", (event) => {
    if (!musicDisc.hasPointerCapture(event.pointerId)) return;

    const currentAngle = getPointerAngle(event);
    let angleChange = currentAngle - previousDiscAngle;
    if (angleChange > 180) angleChange -= 360;
    if (angleChange < -180) angleChange += 360;
    previousDiscAngle = currentAngle;

    if (angleChange !== 0) {
        draggedDisc = true;
        discRotation += angleChange;
        musicDisc.style.setProperty("--disc-angle", `${discRotation}deg`);
        seekByRotation(angleChange);
    }
});

function stopDiscDrag(event) {
    if (!musicDisc.hasPointerCapture(event.pointerId)) return;

    musicDisc.releasePointerCapture(event.pointerId);
    musicDisc.classList.remove("is-dragging");
    if (event.type === "pointercancel") draggedDisc = false;
}

musicDisc.addEventListener("pointerup", stopDiscDrag);
musicDisc.addEventListener("pointercancel", stopDiscDrag);

musicPlayer.addEventListener("loadedmetadata", () => {
    if (pendingSeek === 0 || !Number.isFinite(musicPlayer.duration)) return;

    try {
        musicPlayer.currentTime = Math.max(
            0,
            Math.min(
                musicPlayer.duration,
                musicPlayer.currentTime + pendingSeek
            )
        );
        pendingSeek = 0;
        musicStatus.textContent = seekInstructions;
    } catch {
        musicStatus.textContent = "Could not seek this track.";
    }
});

musicPlayer.addEventListener("error", () => {
    musicStatus.textContent =
        `Could not load ${musicTitle.textContent}. Choose another audio file.`;
});

musicPlayer.addEventListener("play", () => {
    lastPlayedTrackId = currentTrackId;
    musicDisc.classList.add("is-playing");
    musicDisc.setAttribute("aria-label", `Pause ${musicTitle.textContent}`);
    musicDisc.setAttribute("aria-pressed", "true");
    musicStatus.textContent = seekInstructions;
});

musicPlayer.addEventListener("pause", () => {
    musicDisc.classList.remove("is-playing");
    musicDisc.setAttribute("aria-label", `Play ${musicTitle.textContent}`);
    musicDisc.setAttribute("aria-pressed", "false");
});

musicPlayer.addEventListener("ended", () => {
    musicDisc.classList.remove("is-playing");
    musicDisc.setAttribute("aria-label", `Play ${musicTitle.textContent}`);
    musicDisc.setAttribute("aria-pressed", "false");
    playNextQueuedTrack();
});