import { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  addDoc,
} from "firebase/firestore";

import "./App.css";

const firebaseConfig = {
  apiKey: "AIzaSyCWGgdhThjXIMZY8ZiFL9fHpE23iK5ZOgc",
  authDomain: "webrtc-8afb1.firebaseapp.com",
  databaseURL: "https://webrtc-8afb1-default-rtdb.firebaseio.com",
  projectId: "webrtc-8afb1",
  storageBucket: "webrtc-8afb1.appspot.com",
  messagingSenderId: "332761240695",
  appId: "1:332761240695:web:46bc693ec78566a85fa272",
  measurementId: "G-2DC5H183ET",
};

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

function App() {
  const [callInput, setCallInput] = useState(""); // Cambia a nombre de llamada
  const [callName, setCallName] = useState(""); // Nuevo estado para el nombre personalizado
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  const pcRef = useRef(null);
  const lsRef = useRef(null);
  const rsRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    console.log("Initializing peer connection");
    pcRef.current = new RTCPeerConnection(servers);

    pcRef.current.onicecandidate = (event) => {
      console.log("New ICE candidate:", event.candidate);
    };

    pcRef.current.oniceconnectionstatechange = () => {
      console.log(
        "ICE connection state changed to:",
        pcRef.current.iceConnectionState
      );
    };

    pcRef.current.onconnectionstatechange = () => {
      console.log(
        "Connection state changed to:",
        pcRef.current.connectionState
      );
    };

    // Configurar el manejo de tracks remotos
    pcRef.current.ontrack = (event) => {
      console.log("Received remote track", event.track);
      event.streams[0].getTracks().forEach((track) => {
        console.log("Adding track to remote stream:", track.kind);
        rsRef.current.addTrack(track);
      });

      // Asegurarse de que el video remoto se actualice
      if (remoteVideoRef.current) {
        console.log("Updating remote video source");
        remoteVideoRef.current.srcObject = rsRef.current;
      }
    };

    // Inicializar el stream remoto
    rsRef.current = new MediaStream();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = rsRef.current;
    }
  }, []);

  async function createSilentVideoTrack() {
    console.log("Creating silent video track");
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const stream = canvas.captureStream();
    const track = stream.getVideoTracks()[0];
    track.enabled = false; // Deshabilitar el video de manera similar al audio silenciado
    return track;
  }

  async function createSilentAudioTrack() {
    console.log("Creating silent audio track");
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    const track = dst.stream.getAudioTracks()[0];
    track.enabled = false;
    return track;
  }

  async function handleStartWebcam() {
    console.log("Starting webcam");
    try {
      lsRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setHasVideo(true);
      setHasAudio(true);
      console.log("Got video and audio");
    } catch (e) {
      console.warn("No se pudo acceder a la cámara y micrófono:", e);
      try {
        lsRef.current = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setHasVideo(true);
        setHasAudio(false);
        console.log("Got only video");
      } catch (e) {
        console.warn("No se pudo acceder a la cámara:", e);
        try {
          lsRef.current = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          setHasVideo(false);
          setHasAudio(true);
          console.log("Got only audio");
        } catch (e) {
          console.warn("No se pudo acceder al micrófono:", e);
          lsRef.current = new MediaStream();
          const silentAudioTrack = await createSilentAudioTrack();
          const silentVideoTrack = await createSilentVideoTrack(); // Agregar video silenciado
          lsRef.current.addTrack(silentAudioTrack);
          lsRef.current.addTrack(silentVideoTrack); // Agregar el track de video
          setHasVideo(false);
          setHasAudio(false);
          console.log("Using silent audio and video tracks");
        }
      }
    }

    console.log("Adding tracks to peer connection");
    lsRef.current.getTracks().forEach((track) => {
      pcRef.current.addTrack(track, lsRef.current);
    });

    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = lsRef.current;
      console.log("Set local video source");
    }
  }
  async function handleCallButton() {
    if (!callName) {
      alert("Please enter a name for the call");
      return;
    }

    console.log("Creating call with name:", callName);
    const callsCollection = collection(firestore, "calls");
    const callDoc = doc(callsCollection, callName); // Usar el nombre personalizado
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    setCallInput(callName); // Asignar el nombre a la entrada

    pcRef.current.onicecandidate = (event) => {
      event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
    };

    console.log("Creating offer");
    const offerDescription = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDoc, { offer });
    console.log("Offer set in Firestore");

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pcRef.current.currentRemoteDescription && data?.answer) {
        console.log("Received answer from Firestore");
        const answerDescription = new RTCSessionDescription(data.answer);
        pcRef.current.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("Received ICE candidate from Firestore");
          const candidate = new RTCIceCandidate(change.doc.data());
          pcRef.current.addIceCandidate(candidate);
        }
      });
    });
  }

  async function handleAnswerButton() {
    if (!callInput) {
      alert("Please enter the name of the call");
      return;
    }

    console.log("Answering call with name:", callInput);
    const callDoc = doc(firestore, "calls", callInput); // Usar el nombre para buscar la llamada
    const answerCandidates = collection(callDoc, "answerCandidates");
    const offerCandidates = collection(callDoc, "offerCandidates");

    pcRef.current.onicecandidate = (event) => {
      event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
    };

    const callData = (await getDoc(callDoc)).data();

    if (!callData) {
      alert("Call not found");
      return;
    }

    const offerDescription = callData.offer;
    console.log("Received offer from Firestore");
    await pcRef.current.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    console.log("Creating answer");
    const answerDescription = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await updateDoc(callDoc, { answer });
    console.log("Answer set in Firestore");

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("Received ICE candidate from Firestore");
          let data = change.doc.data();
          pcRef.current.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }

  function handleHangup() {
    console.log("Hanging up");
    if (pcRef.current) {
      pcRef.current.close();
    }
    if (lsRef.current) {
      lsRef.current.getTracks().forEach((track) => track.stop());
    }
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setHasVideo(false);
    setHasAudio(false);
  }

  return (
    <>
      <h2>1. Start your Webcam</h2>
      <div className="videos">
        <span>
          <h3>Local Stream</h3>
          <video
            ref={webcamVideoRef}
            id="webcamVideo"
            autoPlay
            playsInline
          ></video>
        </span>
        <span>
          <h3>Remote Stream</h3>
          <video
            ref={remoteVideoRef}
            id="remoteVideo"
            autoPlay
            playsInline
          ></video>
        </span>
      </div>

      <button id="webcamButton" onClick={handleStartWebcam}>
        Start webcam
      </button>

      <h2>2. Create a new Call</h2>
      <input
        type="text"
        placeholder="Enter call name"
        value={callName}
        onChange={(e) => setCallName(e.target.value)} // Entrada para el nombre
      />
      <button onClick={handleCallButton} id="callButton">
        Create Call
      </button>

      <h2>3. Join a Call</h2>
      <input
        id="callInput"
        placeholder="Enter call name to join"
        value={callInput}
        onChange={(e) => setCallInput(e.target.value)}
      />
      <button id="answerButton" onClick={handleAnswerButton}>
        Answer Call
      </button>

      <h2>4. Hangup</h2>
      <button id="hangupButton" onClick={handleHangup}>
        Hangup
      </button>

      <div>
        <p>
          Estado: {hasVideo ? "Video disponible" : "Video no disponible"},{" "}
          {hasAudio ? "Audio disponible" : "Audio no disponible"}
        </p>
      </div>
    </>
  );
}

export default App;
