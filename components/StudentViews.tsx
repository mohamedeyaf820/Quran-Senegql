import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { ClassGroup, User, EnrollmentRequest, EnrollmentStatus, Content, ContentType, Quiz, QuestionType, QuizAttempt, LiveSession, Question, SubscriptionPlan, BADGES_LIST, ForumPost, Resource, Comment, Surah, Ayah } from '../types';
import { BookOpen, Search, PlayCircle, FileText, Music, Send, Clock, Award, AlertTriangle, ChevronRight, Mic, StopCircle, Video, Calendar, ThumbsUp, MessageCircle, Download, Share2, CreditCard, Lock, CheckCircle, Trash2, X, Star, Settings, Play, Pause, Volume2, FastForward, Activity, Zap, Book, ChevronLeft, Loader2, RefreshCw, XCircle } from 'lucide-react';

interface StudentProps {
  currentUser: User;
}

// --- HELPERS ---

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// --- CUSTOM COMPONENTS ---

const CustomAudioPlayer: React.FC<{ src: string, title?: string, type?: 'minimal' | 'full', onPlay?: () => void }> = ({ src, title, type = 'full', onPlay }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);

    // Reset state when source changes
    useEffect(() => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setPlaybackRate(1);
        if(audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.load();
        }
    }, [src]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setCurrentTime(audio.currentTime);
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const setAudioData = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
            if (onPlay) onPlay();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current || !duration) return;
        const newTime = (parseFloat(e.target.value) / 100) * duration;
        audioRef.current.currentTime = newTime;
        setProgress(parseFloat(e.target.value));
    };

    const changeSpeed = () => {
        if (!audioRef.current) return;
        const rates = [1, 1.25, 1.5, 2, 0.75];
        const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
        audioRef.current.playbackRate = nextRate;
        setPlaybackRate(nextRate);
    };

    if (type === 'minimal') {
        return (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm w-fit">
                <audio ref={audioRef} src={src} preload="metadata" />
                <button 
                    onClick={togglePlay}
                    className="w-8 h-8 flex items-center justify-center bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200 transition-colors shrink-0"
                >
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                </button>
                <div className="flex flex-col min-w-[80px]">
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={progress || 0} 
                        onChange={handleSeek}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-teal-600 [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <span className="text-[10px] text-gray-500 font-mono text-right mt-0.5">{formatTime(currentTime)}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 p-4 rounded-xl shadow-sm">
            <audio ref={audioRef} src={src} preload="metadata" />
            <div className="flex items-center gap-4">
                <button 
                    onClick={togglePlay}
                    className="w-12 h-12 flex items-center justify-center bg-white text-cyan-600 rounded-full shadow-md hover:scale-105 transition-transform border border-cyan-50 shrink-0"
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>
                
                <div className="flex-1 space-y-2 min-w-0">
                    {title && (
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider truncate mr-2">{title}</span>
                            <div className="flex items-center gap-2 shrink-0">
                                <button 
                                    onClick={changeSpeed}
                                    className="text-[10px] font-bold bg-white/60 hover:bg-white text-cyan-700 px-2 py-0.5 rounded transition-colors border border-cyan-100 flex items-center gap-1"
                                    title="Vitesse de lecture"
                                >
                                    <FastForward size={10} />
                                    {playbackRate}x
                                </button>
                                <span className="text-[10px] bg-cyan-200 text-cyan-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Volume2 size={10} /> MP3
                                </span>
                            </div>
                        </div>
                    )}
                    
                    <div className="relative w-full h-2 bg-cyan-200/50 rounded-full overflow-hidden">
                        <div 
                            className="absolute top-0 left-0 h-full bg-cyan-500 rounded-full transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        ></div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={progress || 0} 
                            onChange={handleSeek}
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    
                    <div className="flex justify-between text-[10px] font-mono text-cyan-600">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AudioRecorder: React.FC<{ onRecordingComplete: (base64: string) => void, onCancel: () => void }> = ({ onRecordingComplete, onCancel }) => {
    const [timer, setTimer] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<any>(null);
    const isCancelledRef = useRef(false);
    const streamRef = useRef<MediaStream | null>(null);
    
    // Visualization
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        startRecording();
        return () => {
            cleanup();
        };
    }, []);

    const cleanup = () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            // Init MediaRecorder
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];
            isCancelledRef.current = false;

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                if (isCancelledRef.current) {
                    return;
                }
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const base64 = await blobToBase64(blob);
                onRecordingComplete(base64);
            };

            mediaRecorderRef.current.start();
            
            // Start Timer
            timerIntervalRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev >= 180) { // 3 min
                        stopRecordingLogic();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);

            // Visualizer Setup
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            visualize();

        } catch (err) {
            console.error("Erreur accès micro:", err);
            // alert handled in chatbot for global errors, but here we can just cancel
            onCancel();
        }
    };

    const visualize = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyserRef.current!.getByteFrequencyData(dataArray);

            canvasCtx.fillStyle = '#fef2f2'; // bg-red-50
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`; // Red-ish
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };
        draw();
    };

    const handleCancel = () => {
        isCancelledRef.current = true;
        stopRecordingLogic();
        onCancel();
    };

    const stopRecordingLogic = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        cleanup();
    };

    return (
        <div className="flex flex-col gap-2 bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute top-0 left-0 opacity-75"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full relative z-10"></div>
                </div>
                <span className="text-red-700 font-mono font-bold w-12">{formatTime(timer)}</span>
                <div className="flex-1 text-xs text-red-400">Enregistrement en cours...</div>
                <button onClick={stopRecordingLogic} className="bg-white text-red-600 p-2 rounded-full border border-red-200 hover:bg-red-100 shadow-sm transition-colors"><CheckCircle size={18} /></button>
                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 p-2 transition-colors"><X size={18} /></button>
            </div>
            {/* Waveform Visualizer */}
            <canvas ref={canvasRef} width={300} height={50} className="w-full h-12 rounded bg-white/50" />
        </div>
    );
};

const QuizQuestionAudioInput: React.FC<{
    onSave: (base64: string) => void;
    existingAnswer?: string;
    onDelete: () => void;
}> = ({ onSave, existingAnswer, onDelete }) => {
    const [isRecording, setIsRecording] = useState(false);

    if (existingAnswer) {
        return (
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Mic size={12}/> Votre récitation enregistrée</span>
                    <button onClick={onDelete} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors flex items-center gap-1 text-xs font-medium" title="Supprimer">
                        <Trash2 size={14} /> Recommencer
                    </button>
                </div>
                <CustomAudioPlayer src={existingAnswer} type="minimal" />
            </div>
        );
    }

    if (isRecording) {
        return (
            <div className="mt-2">
                <AudioRecorder 
                    onRecordingComplete={(b64) => {
                        onSave(b64);
                        setIsRecording(false);
                    }}
                    onCancel={() => setIsRecording(false)}
                />
            </div>
        );
    }

    return (
        <button 
            onClick={() => setIsRecording(true)}
            className="mt-2 flex items-center gap-2 text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-3 rounded-xl font-bold transition-all w-full md:w-auto"
        >
            <Mic size={20} />
            Enregistrer ma récitation
        </button>
    );
};

const ContentComments: React.FC<{ content: Content, currentUser: User, onUpdate: () => void }> = ({ content, currentUser, onUpdate }) => {
    const [text, setText] = useState('');
    const [audioData, setAudioData] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    // Ensure comments array exists
    const comments = content.comments || [];

    const handleSubmit = () => {
        if (!text.trim() && !audioData) return;

        const newComment: Comment = {
            id: Date.now().toString(),
            userId: currentUser.id,
            userName: `${currentUser.firstName} ${currentUser.lastName}`,
            text: text,
            audioUrl: audioData || undefined,
            createdAt: new Date().toISOString()
        };

        storageService.addComment(content.id, newComment);
        setText('');
        setAudioData(null);
        onUpdate(); // Refresh parent
    };

    return (
        <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MessageCircle size={18} className="text-teal-600"/> 
                Commentaires ({comments.length})
            </h4>
            
            {/* List Comments */}
            {comments.length > 0 ? (
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                    {comments.map(c => (
                        <div key={c.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold">
                                        {c.userName.charAt(0)}
                                    </div>
                                    <span className="font-bold text-xs text-gray-700">{c.userName}</span>
                                </div>
                                <span className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            {c.text && <p className="text-sm text-gray-600 mb-2 leading-relaxed">{c.text}</p>}
                            {c.audioUrl && (
                                <div className="mt-2">
                                    <CustomAudioPlayer src={c.audioUrl} type="minimal" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-4 text-gray-400 text-sm mb-4">Soyez le premier à commenter !</div>
            )}

            {/* Input Area */}
            <div className="flex flex-col gap-3">
                {/* Audio Preview if recorded */}
                {audioData && (
                    <div className="flex items-center gap-3 bg-teal-50 p-3 rounded-xl border border-teal-100 self-start animate-in zoom-in w-full md:w-auto">
                        <div className="text-xs font-bold text-teal-700 flex items-center gap-1 mr-2">
                            <Mic size={14} /> Vocal prêt
                        </div>
                        <CustomAudioPlayer src={audioData} type="minimal" />
                        <button onClick={() => setAudioData(null)} className="text-red-400 hover:text-red-600 p-2 ml-2 hover:bg-red-50 rounded-full transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}

                {/* Recorder UI */}
                {isRecording && (
                    <AudioRecorder 
                        onRecordingComplete={(base64) => {
                            setAudioData(base64);
                            setIsRecording(false);
                        }}
                        onCancel={() => setIsRecording(false)}
                    />
                )}

                {/* Main Input Bar */}
                {!isRecording && (
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-1 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                             <textarea 
                                className="w-full bg-transparent border-none p-3 text-sm focus:ring-0 resize-none max-h-24" 
                                placeholder={audioData ? "Ajouter une note textuelle au vocal..." : "Posez une question ou partagez votre avis..."}
                                rows={1}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                            />
                        </div>
                        
                        <button 
                            onClick={() => setIsRecording(true)} 
                            className={`p-3 rounded-xl transition-all ${audioData ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:shadow-sm'}`}
                            disabled={!!audioData}
                            title="Enregistrer un vocal"
                        >
                            <Mic size={22} />
                        </button>
                        
                        <button 
                            onClick={handleSubmit} 
                            disabled={!text && !audioData}
                            className={`p-3 rounded-xl transition-all ${(!text && !audioData) ? 'bg-gray-100 text-gray-300' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20 hover:scale-105'}`}
                        >
                            <Send size={22} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- NEW VIEWS ---

export const StudentQuranReader: React.FC<StudentProps> = () => {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showTranslation, setShowTranslation] = useState(true);

    const fetchSurahs = () => {
        setLoading(true);
        setError('');
        // Utilisation de HTTPS explicite
        fetch('https://api.alquran.cloud/v1/surah')
            .then(res => {
                if (!res.ok) throw new Error("Erreur réseau");
                return res.json();
            })
            .then(data => {
                if(data.code === 200) {
                    setSurahs(data.data);
                } else {
                    throw new Error('Erreur API Code');
                }
                setLoading(false);
            })
            .catch(err => {
                console.warn("Failed to fetch surahs", err);
                setError("Impossible de charger le Coran. Vérifiez votre connexion.");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchSurahs();
    }, []);

    const fetchSurahContent = (number: number) => {
        setLoading(true);
        setError('');
        
        // Fetch Arabic text first (Primary)
        fetch(`https://api.alquran.cloud/v1/surah/${number}`)
            .then(async (resAr) => {
                if (!resAr.ok) throw new Error("Failed to fetch arabic");
                const dataAr = await resAr.json();
                
                // Try fetching translation separately so if it fails, we still show Arabic
                try {
                    const resFr = await fetch(`https://api.alquran.cloud/v1/surah/${number}/fr.hamidullah`);
                    if(resFr.ok) {
                        const dataFr = await resFr.json();
                        if (dataAr.code === 200) {
                            const mergedAyahs = dataAr.data.ayahs.map((ayah: any, index: number) => ({
                                number: ayah.number,
                                text: ayah.text,
                                numberInSurah: ayah.numberInSurah,
                                juz: ayah.juz,
                                translation: dataFr.data?.ayahs[index]?.text || "Traduction indisponible"
                            }));
                            setAyahs(mergedAyahs);
                            setSelectedSurah(dataAr.data);
                            setLoading(false);
                            return;
                        }
                    }
                } catch (e) {
                    console.warn("Translation failed", e);
                }

                // Fallback: Show only Arabic if translation fails
                 if (dataAr.code === 200) {
                     const arabicOnlyAyahs = dataAr.data.ayahs.map((ayah: any) => ({
                        number: ayah.number,
                        text: ayah.text,
                        numberInSurah: ayah.numberInSurah,
                        juz: ayah.juz,
                        translation: ""
                    }));
                    setAyahs(arabicOnlyAyahs);
                    setSelectedSurah(dataAr.data);
                    setLoading(false);
                 } else {
                     throw new Error("API Data Error");
                 }
            })
            .catch(err => {
                console.warn(err);
                setError("Erreur lors du chargement de la sourate.");
                setLoading(false);
            });
    };

    if (loading && !selectedSurah && surahs.length === 0) {
         return <div className="flex flex-col items-center justify-center h-64 text-teal-600 gap-4"><Loader2 className="animate-spin" size={40} /> <span className="text-sm animate-pulse">Connexion à la base de données coranique...</span></div>;
    }

    if (error && surahs.length === 0) {
        return (
            <div className="text-center p-12 text-red-500 font-bold bg-white rounded-xl shadow-sm border border-red-100 m-4">
                <p className="mb-4">{error}</p>
                <button onClick={fetchSurahs} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 mx-auto">
                    <RefreshCw size={18}/> Réessayer
                </button>
            </div>
        );
    }

    if (selectedSurah) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right">
                <div className="flex items-center justify-between">
                    <button onClick={() => setSelectedSurah(null)} className="flex items-center gap-2 text-teal-600 font-bold hover:underline">
                        <ChevronLeft size={20}/> Retour aux Sourates
                    </button>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                            <input type="checkbox" checked={showTranslation} onChange={() => setShowTranslation(!showTranslation)} className="rounded text-teal-600 focus:ring-teal-500"/>
                            Afficher Traduction
                        </label>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
                    <div className="text-center border-b border-gray-100 pb-6 mb-6">
                        <h2 className="text-3xl font-bold text-teal-900 mb-2">{selectedSurah.name}</h2>
                        <p className="text-gray-500">{selectedSurah.englishName} • {selectedSurah.numberOfAyahs} Versets • {selectedSurah.revelationType}</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-teal-500" size={32} />
                            Chargement du texte sacré...
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Bismillah handling */}
                            {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                                <div className="text-center font-amiri text-3xl text-gray-600 mb-10 mt-4 leading-loose">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
                            )}

                            {ayahs.map(ayah => (
                                <div key={ayah.number} className="group border-b border-gray-50 pb-6 last:border-0 hover:bg-teal-50/30 rounded-xl transition-colors p-4">
                                    <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-start gap-4 mb-4">
                                         <div className="w-10 h-10 rounded-full border border-teal-200 text-teal-600 flex items-center justify-center text-xs font-bold shrink-0 self-start md:self-auto order-2 md:order-1">
                                            {ayah.numberInSurah}
                                        </div>
                                        <p className="w-full text-right font-amiri text-4xl leading-[2.5] text-gray-800 order-1 md:order-2" dir="rtl">
                                            {ayah.text}
                                        </p>
                                    </div>
                                    {showTranslation && ayah.translation && (
                                        <p className="text-gray-500 text-base pl-0 md:pl-14 italic leading-relaxed">{ayah.translation}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-teal-900 flex items-center gap-3">
                <Book className="text-teal-600" /> Le Saint Coran (Mushaf)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {surahs.map(surah => (
                    <button 
                        key={surah.number} 
                        onClick={() => fetchSurahContent(surah.number)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-teal-300 hover:shadow-md transition-all text-left flex justify-between items-center group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center font-bold text-gray-400 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                {surah.number}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{surah.englishName}</h3>
                                <p className="text-xs text-gray-400">{surah.englishNameTranslation}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-amiri font-bold text-lg text-teal-800">{surah.name}</div>
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{surah.numberOfAyahs} versets</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export const StudentResources: React.FC<StudentProps> = () => {
    const resources = storageService.getResources() || [];
    const [category, setCategory] = useState<string>('ALL');
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    const filtered = category === 'ALL' ? resources : resources.filter(r => r.category === category);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-teal-900">Bibliothèque & Ressources</h2>
            <div className="flex gap-2 border-b overflow-x-auto pb-2">
                {['ALL', 'TAFSIR', 'TAJWID', 'DUA', 'HISTORY'].map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 font-bold whitespace-nowrap ${category === cat ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-400'}`}>
                        {cat === 'ALL' ? 'Tout' : cat}
                    </button>
                ))}
            </div>
            
            {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border border-dashed rounded-xl">Aucune ressource trouvée dans cette catégorie.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map(r => (
                        <div key={r.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded mb-2 inline-block self-start">{r.category}</span>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{r.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4 flex-1">{r.content}</p>
                            <button className="text-teal-600 font-bold text-sm hover:underline self-start" onClick={() => setSelectedResource(r)}>Lire la suite &rarr;</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Reading Modal */}
            {selectedResource && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">{selectedResource.category}</span>
                                <h3 className="text-2xl font-bold text-gray-800 mt-1">{selectedResource.title}</h3>
                            </div>
                            <button onClick={() => setSelectedResource(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} className="text-gray-500"/></button>
                        </div>
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <p className="text-gray-700 leading-8 text-lg font-serif whitespace-pre-line">
                                {selectedResource.content}
                            </p>
                            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
                                <button onClick={() => setSelectedResource(null)} className="bg-teal-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-teal-700">Fermer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const StudentForum: React.FC<StudentProps> = ({ currentUser }) => {
    const [posts, setPosts] = useState<ForumPost[]>(storageService.getForumPosts() || []);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        storageService.addForumPost({
            id: Date.now().toString(),
            userId: currentUser.id,
            userName: `${currentUser.firstName} ${currentUser.lastName}`,
            likes: 0,
            replies: [],
            createdAt: new Date().toISOString(),
            ...newPost
        });
        setPosts(storageService.getForumPosts());
        setShowForm(false);
        setNewPost({ title: '', content: '', category: 'General' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-teal-900">Communauté</h2>
                <button onClick={() => setShowForm(!showForm)} className="bg-teal-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-teal-700">
                    {showForm ? 'Fermer' : 'Nouvelle Discussion'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border space-y-4 animate-in fade-in">
                    <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none" placeholder="Titre du sujet" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} required />
                    <textarea className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none" placeholder="Votre message..." rows={3} value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} required />
                    <div className="flex justify-end">
                        <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-teal-700">Publier</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed text-gray-400">
                        Aucune discussion pour le moment. Lancez le premier sujet !
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-teal-200 transition-all">
                            <div className="flex justify-between mb-2">
                                <h3 className="font-bold text-lg text-gray-800">{post.title}</h3>
                                <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-600 mb-4 text-sm leading-relaxed">{post.content}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500 border-t pt-4">
                                <span className="flex items-center gap-1 text-teal-600 font-medium cursor-pointer hover:bg-teal-50 px-2 py-1 rounded"><ThumbsUp size={16} /> {post.likes} J'aime</span>
                                <span className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"><MessageCircle size={16} /> {post.replies?.length || 0} Réponses</span>
                                <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded">Par {post.userName}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export const StudentSubscription: React.FC<StudentProps> = ({ currentUser }) => {
    // Local state for UI update without reload
    const [userPlan, setUserPlan] = useState(currentUser.subscriptionPlan);

    const handleUpgrade = (plan: SubscriptionPlan) => {
        if(confirm(`Confirmer le paiement pour ${plan === SubscriptionPlan.PREMIUM_MONTHLY ? '5000 FCFA' : '50000 FCFA'} ?`)) {
            storageService.upgradeSubscription(currentUser.id, plan);
            setUserPlan(plan);
            alert("Paiement réussi via Wave (Simulé) ! Abonnement activé.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Investissez dans votre Savoir</h2>
                <p className="text-gray-500">Accédez à des contenus exclusifs, des certificats et plus encore.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Free */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800">Gratuit</h3>
                    <div className="text-4xl font-bold my-4">0 <span className="text-sm font-normal text-gray-500">FCFA</span></div>
                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex gap-2 text-sm"><CheckCircle size={16} className="text-green-500"/> Accès Niveaux 0-1</li>
                        <li className="flex gap-2 text-sm"><CheckCircle size={16} className="text-green-500"/> Quiz basiques</li>
                        <li className="flex gap-2 text-sm"><CheckCircle size={16} className="text-green-500"/> Forum communautaire</li>
                    </ul>
                    <button disabled className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-bold">Plan Actuel</button>
                </div>

                {/* Monthly */}
                <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-teal-500 transform scale-105 flex flex-col relative">
                    <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAIRE</div>
                    <h3 className="text-xl font-bold text-teal-800">Mensuel</h3>
                    <div className="text-4xl font-bold my-4 text-teal-600">5.000 <span className="text-sm font-normal text-gray-500">FCFA</span></div>
                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex gap-2 text-sm"><CheckCircle size={16} className="text-teal-500"/> Tout le contenu Gratuit</li>
                        <li className="flex gap-2 text-sm"><CheckCircle size={16} className="text-teal-500"/> Niveaux Avancés (2-X)</li>
                        <li className="flex gap-2 text-sm"><CheckCircle size={16} className="text-teal-500"/> Certificats de réussite</li>
                        <li className="flex gap-2 text-sm"><CheckCircle size={16} className="text-teal-500"/> Support prioritaire</li>
                    </ul>
                    {userPlan === SubscriptionPlan.PREMIUM_MONTHLY ? (
                        <button disabled className="w-full bg-green-100 text-green-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><CheckCircle size={18}/> Activé</button>
                    ) : (
                        <button onClick={() => handleUpgrade(SubscriptionPlan.PREMIUM_MONTHLY)} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20">S'abonner</button>
                    )}
                    <div className="flex justify-center gap-2 mt-4 opacity-70 grayscale">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Wave_Logo.svg/1200px-Wave_Logo.svg.png" className="h-6 object-contain" alt="Wave"/>
                        <span className="text-xs font-bold text-orange-500 self-center">Orange Money</span>
                    </div>
                </div>

                {/* Yearly */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800">Annuel</h3>
                    <div className="text-4xl font-bold my-4">50.000 <span className="text-sm font-normal text-gray-500">FCFA</span></div>
                    <p className="text-green-600 text-xs font-bold mb-4">Économisez 10.000 FCFA</p>
                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex gap-2 text-sm"><CheckCircle size={16} className="text-gray-800"/> Tous les avantages Mensuel</li>
                        <li className="flex gap-2 text-sm"><CheckCircle size={16} className="text-gray-800"/> 2 mois offerts</li>
                        <li className="flex gap-2 text-sm"><CheckCircle size={16} className="text-gray-800"/> Badge "Donateur"</li>
                    </ul>
                    {userPlan === SubscriptionPlan.PREMIUM_YEARLY ? (
                        <button disabled className="w-full bg-green-100 text-green-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><CheckCircle size={18}/> Activé</button>
                    ) : (
                        <button onClick={() => handleUpgrade(SubscriptionPlan.PREMIUM_YEARLY)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800">S'abonner</button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MODIFIED EXISTING VIEWS ---

export const StudentClasses: React.FC<StudentProps> = ({ currentUser }) => {
  const [availableClasses, setAvailableClasses] = useState<ClassGroup[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<EnrollmentRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const classes = storageService.getClasses() || [];
    const filtered = classes.filter(c => c.gender === 'Mixte' || c.gender === currentUser.gender);
    setAvailableClasses(filtered);
    const enrollments = storageService.getEnrollments() || [];
    setMyEnrollments(enrollments.filter(e => e.userId === currentUser.id));
  }, [currentUser]);

  const handleEnroll = (cls: ClassGroup) => {
    // Check Subscription for Advanced Levels
    const levelNum = parseInt(cls.level.replace(/\D/g, '')) || 0;
    if (levelNum > 1 && currentUser.subscriptionPlan === SubscriptionPlan.FREE) {
        alert("Ce cours nécessite un abonnement Premium.");
        return;
    }

    const req: EnrollmentRequest = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      classId: cls.id,
      className: cls.name,
      status: EnrollmentStatus.PENDING,
      requestedAt: new Date().toISOString()
    };
    storageService.createEnrollment(req);
    // Update local state instead of reloading
    const updatedEnrollments = storageService.getEnrollments().filter(e => e.userId === currentUser.id);
    setMyEnrollments(updatedEnrollments);
    alert('Demande envoyée !');
  };

  const getStatus = (classId: string) => {
    const enrollment = myEnrollments.find(e => e.classId === classId);
    return enrollment ? enrollment.status : null;
  };

  const filteredClasses = availableClasses.filter(cls => cls.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in">
       <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-100 pb-6">
        <div>
            <h2 className="text-3xl font-bold text-teal-950">Catalogue</h2>
            <p className="text-gray-500 mt-1">Explorez et rejoignez des classes adaptées à votre niveau.</p>
        </div>
        <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500" size={18} />
            <input type="text" placeholder="Rechercher..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClasses.map(cls => {
            const status = getStatus(cls.id);
            const isEnrolled = cls.studentIds && cls.studentIds.includes(currentUser.id);
            const levelNum = parseInt(cls.level.replace(/\D/g, '')) || 0;
            const isLocked = levelNum > 1 && currentUser.subscriptionPlan === SubscriptionPlan.FREE;

            return (
                <div key={cls.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
                    <div className="h-32 bg-[#042f2e] p-6 relative overflow-hidden flex flex-col justify-between">
                        <div className="relative z-10 flex justify-between">
                            <span className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-teal-100">{cls.level}</span>
                            {isLocked && <Lock className="text-amber-400" size={16} />}
                        </div>
                        <h3 className="text-white font-bold text-xl relative z-10">{cls.name}</h3>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <p className="text-gray-600 text-sm mb-6 flex-1">{cls.description}</p>
                        {isEnrolled ? (
                            <button disabled className="w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl font-semibold border border-emerald-100 cursor-default">Inscrit ✓</button>
                        ) : status === EnrollmentStatus.PENDING ? (
                            <button disabled className="w-full bg-amber-50 text-amber-700 py-3 rounded-xl font-semibold border border-amber-100 cursor-default">En attente</button>
                        ) : (
                            <button onClick={() => handleEnroll(cls)} className={`w-full py-3 rounded-xl font-semibold shadow-lg ${isLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'}`}>
                                {isLocked ? 'Premium Requis' : 'Rejoindre'}
                            </button>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export const StudentClassroom: React.FC<StudentProps> = ({ currentUser }) => {
  const [myClasses, setMyClasses] = useState<ClassGroup[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [viewedContent, setViewedContent] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0); // Trigger re-render for comments
  
  // States for Dashboard & Quiz
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // States for Dashboard Widgets
  const [upcomingLives, setUpcomingLives] = useState<LiveSession[]>([]);
  const [pendingQuizzes, setPendingQuizzes] = useState<Quiz[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [dailyInspiration, setDailyInspiration] = useState(storageService.getDailyInspiration());

  useEffect(() => {
    const classes = storageService.getClasses() || [];
    const enrolledClasses = classes.filter(c => c.studentIds && c.studentIds.includes(currentUser.id));
    setMyClasses(enrolledClasses);
    setViewedContent(storageService.getViewedContent(currentUser.id) || []);

    // Dashboard Data Calculation
    // 1. Lives
    const allLives = storageService.getLives() || [];
    const myLives = allLives.filter(l => enrolledClasses.some(c => c.id === l.classId));
    // Filter future lives and sort by date
    const futureLives = myLives
        .filter(l => new Date(l.scheduledAt) > new Date())
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    setUpcomingLives(futureLives.slice(0, 3));

    // 2. Pending Quizzes
    const allQuizzes = storageService.getQuizzes() || [];
    const myQuizzes = allQuizzes.filter(q => enrolledClasses.some(c => c.id === q.classId));
    const myAttempts = storageService.getAttempts(currentUser.id) || [];
    const pending = myQuizzes.filter(q => {
        const bestAttempt = myAttempts
            .filter(a => a.quizId === q.id)
            .sort((a, b) => b.score - a.score)[0];
        return !bestAttempt || !bestAttempt.passed;
    });
    setPendingQuizzes(pending.slice(0, 3));

    // 3. Overall Progress (Average of all class progress)
    let totalPercent = 0;
    let count = 0;
    enrolledClasses.forEach(cls => {
        const classContents = storageService.getContent(cls.id) || [];
        const totalContent = classContents.length;
        if(totalContent > 0) {
            const seenCount = classContents.filter(c => viewedContent.includes(c.id)).length; 
            const p = (seenCount / totalContent) * 100;
            totalPercent += p;
            count++;
        }
    });
    setOverallProgress(count > 0 ? Math.round(totalPercent / count) : 0);

  }, [currentUser, forceUpdate]); 

  const handleDownload = (content: Content) => {
    const link = document.createElement("a");
    link.href = content.dataUrl;
    link.download = content.fileName || `fichier-${content.title}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewContent = (id: string) => {
      if (!viewedContent.includes(id)) {
          storageService.markContentViewed(currentUser.id, id);
          setViewedContent(prev => [...prev, id]);
          // Re-trigger progress calculation
          setForceUpdate(prev => prev + 1);
      }
  };

  // Quiz Handling
  const startQuiz = (quiz: Quiz) => {
      setActiveQuiz(quiz);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizScore(0);
      setSelectedClassId(quiz.classId); // Ensure context is set if accessing from dashboard
  };

  const submitQuiz = () => {
      if(!activeQuiz) return;
      let score = 0;
      let totalPoints = 0;
      
      activeQuiz.questions.forEach(q => {
          totalPoints += q.points;
          // Simple string match for MCQ/TrueFalse (In real app, ID match)
          if(q.type === QuestionType.MCQ_SINGLE || q.type === QuestionType.TRUE_FALSE) {
              if(q.options && q.correctAnswers) {
                   score += q.points; // AUTO PASS DEMO (Simulate logic check here)
              } else {
                  score += q.points; 
              }
          } else {
              // For OPEN and AUDIO questions, simple completion adds points in this demo
              if (quizAnswers[q.id]) {
                score += q.points;
              }
          }
      });

      const finalPercent = Math.round((score / totalPoints) * 100) || 100;
      setQuizScore(finalPercent);
      setQuizSubmitted(true);
      
      const passed = finalPercent >= activeQuiz.passingScore;
      
      storageService.saveQuizAttempt({
          id: Date.now().toString(),
          quizId: activeQuiz.id,
          userId: currentUser.id,
          answers: quizAnswers,
          score: finalPercent,
          passed: passed,
          startedAt: new Date().toISOString(), // approximate
          completedAt: new Date().toISOString()
      });
  };

  if (activeQuiz) {
      return (
          <div className="max-w-3xl mx-auto space-y-6">
              <button onClick={() => setActiveQuiz(null)} className="text-gray-500 hover:text-gray-800 font-medium mb-4">&larr; Retour au cours</button>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                      <h2 className="text-2xl font-bold text-indigo-900">{activeQuiz.title}</h2>
                      <div className="flex gap-4 text-sm font-medium text-gray-500">
                          <span className="flex items-center gap-1"><Clock size={16}/> {activeQuiz.timeLimitMinutes} min</span>
                          <span className="flex items-center gap-1"><Award size={16}/> Pass: {activeQuiz.passingScore}%</span>
                      </div>
                  </div>

                  {!quizSubmitted ? (
                      <div className="space-y-8">
                          {activeQuiz.questions.map((q, idx) => (
                              <div key={q.id} className="space-y-3">
                                  <h3 className="font-bold text-gray-800 text-lg">{idx + 1}. {q.text}</h3>
                                  
                                  {q.type === QuestionType.MCQ_SINGLE && (
                                      <div className="space-y-2">
                                          {q.options?.map(opt => (
                                              <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-indigo-50 cursor-pointer transition-colors">
                                                  <input 
                                                      type="radio" 
                                                      name={q.id} 
                                                      className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                                                      onChange={() => setQuizAnswers({...quizAnswers, [q.id]: opt})}
                                                  />
                                                  <span className="text-gray-700">{opt}</span>
                                              </label>
                                          ))}
                                      </div>
                                  )}
                                  
                                  {q.type === QuestionType.TRUE_FALSE && (
                                       <div className="flex gap-4">
                                           {['Vrai', 'Faux'].map(opt => (
                                              <label key={opt} className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-indigo-50 cursor-pointer font-bold text-gray-600 has-[:checked]:bg-indigo-100 has-[:checked]:text-indigo-800 has-[:checked]:border-indigo-300">
                                                  <input 
                                                      type="radio" 
                                                      name={q.id} 
                                                      className="hidden"
                                                      onChange={() => setQuizAnswers({...quizAnswers, [q.id]: opt})}
                                                  />
                                                  {opt}
                                              </label>
                                           ))}
                                       </div>
                                  )}

                                  {q.type === QuestionType.OPEN && (
                                      <textarea 
                                          className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" 
                                          rows={3} 
                                          placeholder="Votre réponse..."
                                          onChange={e => setQuizAnswers({...quizAnswers, [q.id]: e.target.value})}
                                      ></textarea>
                                  )}

                                  {q.type === QuestionType.AUDIO_RECITATION && (
                                      <QuizQuestionAudioInput 
                                          onSave={(base64) => setQuizAnswers({...quizAnswers, [q.id]: base64})}
                                          existingAnswer={quizAnswers[q.id]}
                                          onDelete={() => {
                                              const newAnswers = {...quizAnswers};
                                              delete newAnswers[q.id];
                                              setQuizAnswers(newAnswers);
                                          }}
                                      />
                                  )}
                              </div>
                          ))}
                          <button onClick={submitQuiz} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">Soumettre les réponses</button>
                      </div>
                  ) : (
                      <div className="text-center py-10 animate-in zoom-in">
                          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${quizScore >= activeQuiz.passingScore ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {quizScore >= activeQuiz.passingScore ? <CheckCircle size={48} /> : <AlertTriangle size={48} />}
                          </div>
                          <h3 className="text-3xl font-bold text-gray-800 mb-2">Score: {quizScore}%</h3>
                          <p className="text-gray-500 mb-8">{quizScore >= activeQuiz.passingScore ? "Félicitations ! Vous avez validé ce module." : "Ne lâchez rien, révisez et réessayez !"}</p>
                          <button onClick={() => setActiveQuiz(null)} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold">Retour aux cours</button>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // Class Selection View
  if (!selectedClassId) {
    return (
      <div className="space-y-8 animate-in fade-in">
        
        {/* DASHBOARD WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 1. Global Progress Widget */}
            <div className="md:col-span-1 bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg"><Activity size={20} /></div>
                        <span className="text-xs font-bold bg-teal-500 px-2 py-0.5 rounded-full">Niveau {currentUser.level || 1}</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{overallProgress}%</div>
                    <p className="text-teal-100 text-xs mb-4">Progression globale</p>
                    <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                         <div className="bg-white h-full rounded-full" style={{width: `${overallProgress}%`}}></div>
                    </div>
                    <div className="mt-4 flex gap-4 text-xs font-medium text-teal-100">
                        <span>{currentUser.xp || 0} XP</span>
                        <span>{myClasses.length} Cours</span>
                    </div>
                </div>
            </div>

            {/* 2. Daily Inspiration Widget */}
            <div className="md:col-span-1 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 shadow-sm border border-amber-100 flex flex-col justify-center text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>
                 <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center justify-center gap-1"><Star size={12}/> {dailyInspiration.type === 'VERSE' ? 'Verset' : 'Hadith'} du Jour</div>
                 <p className="text-gray-800 font-medium italic text-sm leading-relaxed mb-3">"{dailyInspiration.text}"</p>
                 <p className="text-xs text-amber-500 font-bold">{dailyInspiration.source}</p>
            </div>

            {/* 3. Upcoming Lives Widget */}
            <div className="md:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm"><Video size={16} className="text-red-500"/> Prochains Lives</h3>
                <div className="flex-1 space-y-3 overflow-hidden">
                    {upcomingLives.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs text-center">
                            <Calendar size={24} className="mb-2 opacity-50"/>
                            Aucun cours en direct prévu.
                        </div>
                    ) : (
                        upcomingLives.map(live => (
                            <div key={live.id} className="bg-red-50 p-2.5 rounded-xl border border-red-100 flex justify-between items-center group cursor-pointer hover:bg-red-100 transition-colors">
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-800 text-xs truncate">{live.title}</p>
                                    <p className="text-red-500 text-[10px]">{new Date(live.scheduledAt).toLocaleDateString()}</p>
                                </div>
                                <a href={live.meetingLink} target="_blank" rel="noreferrer" className="bg-white p-1.5 rounded-lg text-red-500 hover:text-red-700 shadow-sm">
                                    <Video size={12} />
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 4. Pending Quizzes Widget */}
            <div className="md:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm"><Zap size={16} className="text-indigo-500"/> Quiz à faire</h3>
                <div className="flex-1 space-y-3 overflow-hidden">
                     {pendingQuizzes.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs text-center">
                            <CheckCircle size={24} className="mb-2 opacity-50"/>
                            Vous êtes à jour !
                        </div>
                    ) : (
                        pendingQuizzes.map(quiz => (
                            <div key={quiz.id} onClick={() => startQuiz(quiz)} className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 flex justify-between items-center group cursor-pointer hover:bg-indigo-100 transition-colors">
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-800 text-xs truncate">{quiz.title}</p>
                                    <p className="text-indigo-600 text-[10px]">{quiz.timeLimitMinutes} min • {quiz.questions.length} Q</p>
                                </div>
                                <ChevronRight size={14} className="text-indigo-400 group-hover:text-indigo-600" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        <div>
            <h2 className="text-2xl font-bold text-teal-900 mb-6">Mes Classes</h2>
            {myClasses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Vous n'êtes inscrit à aucune classe pour le moment.</p>
            </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myClasses.map(cls => {
                    const classContents = storageService.getContent(cls.id) || [];
                    const totalContent = classContents.length;
                    const seenCount = classContents.filter(c => viewedContent.includes(c.id)).length;
                    const progress = totalContent === 0 ? 0 : Math.round((seenCount / totalContent) * 100);

                    return (
                        <div key={cls.id} onClick={() => setSelectedClassId(cls.id)} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:border-teal-200 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                    <BookOpen size={24} />
                                </div>
                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{cls.level}</span>
                            </div>
                            <h3 className="font-bold text-xl text-gray-800 mb-1">{cls.name}</h3>
                            <p className="text-sm text-gray-500 mb-6">{totalContent} leçons disponibles</p>
                            
                            {/* Progress Bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-teal-700">
                                    <span>Progression</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-teal-500 h-2 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}
        </div>
      </div>
    );
  }

  // Inside Selected Class
  const selectedClass = myClasses.find(c => c.id === selectedClassId);
  
  // Guard Clause: If selected class not found (e.g. sync issue), return to list
  if (selectedClassId && !selectedClass) {
      return (
          <div className="text-center py-20">
              <p className="text-gray-500 mb-4">Impossible de charger la classe.</p>
              <button onClick={() => setSelectedClassId(null)} className="text-teal-600 font-bold hover:underline">Retour</button>
          </div>
      );
  }

  const contents = storageService.getContent(selectedClassId) || [];
  const quizzes = storageService.getQuizzes(selectedClassId) || [];
  const lives = storageService.getLives(selectedClassId) || [];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300">
      <button onClick={() => setSelectedClassId(null)} className="text-teal-600 font-bold hover:underline flex items-center gap-1">
        &larr; Retour aux classes
      </button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-teal-900">{selectedClass?.name}</h2>
            <p className="text-gray-500">{selectedClass?.description}</p>
        </div>
      </div>

      {/* LIVES SECTION */}
      {lives.length > 0 && (
          <div className="space-y-4">
              <h3 className="font-bold text-red-800 flex items-center gap-2 text-lg"><Video /> Cours en Direct</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lives.map(live => (
                      <div key={live.id} className="bg-red-50 p-6 rounded-2xl border border-red-100 flex justify-between items-center">
                          <div>
                              <h4 className="font-bold text-red-900">{live.title}</h4>
                              <p className="text-red-700/80 text-sm mt-1 flex items-center gap-2"><Calendar size={14}/> {new Date(live.scheduledAt).toLocaleString()}</p>
                          </div>
                          <a href={live.meetingLink} target="_blank" rel="noreferrer" className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-red-700 transition-colors">
                              Rejoindre
                          </a>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* CONTENT & QUIZZES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <h3 className="font-bold text-gray-800 text-xl">Leçons du cours</h3>
             {contents.length === 0 ? (
                 <div className="text-gray-400 italic">Aucun contenu disponible.</div>
             ) : (
                 contents.map(content => (
                    <div key={content.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-teal-200 transition-all">
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${content.type === ContentType.VIDEO ? 'bg-teal-100 text-teal-600' : content.type === ContentType.AUDIO ? 'bg-cyan-100 text-cyan-600' : 'bg-orange-100 text-orange-600'}`}>
                                {content.type === ContentType.VIDEO && <PlayCircle size={24} />}
                                {content.type === ContentType.AUDIO && <Music size={24} />}
                                {content.type === ContentType.DOCUMENT && <FileText size={24} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-800 text-lg">{content.title}</h3>
                                    {viewedContent.includes(content.id) && <CheckCircle className="text-green-500" size={18} />}
                                </div>
                                <p className="text-gray-500 text-sm mt-1 mb-4">{content.description}</p>
                                
                                {/* Media Player */}
                                <div className="mb-4">
                                    {content.type === ContentType.VIDEO && (
                                        <div className="rounded-xl overflow-hidden bg-gray-50">
                                            <video src={content.dataUrl} controls className="w-full h-auto max-h-[300px]" onPlay={() => handleViewContent(content.id)} />
                                        </div>
                                    )}
                                    {content.type === ContentType.AUDIO && (
                                        <CustomAudioPlayer 
                                            src={content.dataUrl} 
                                            title="Leçon Audio" 
                                            onPlay={() => handleViewContent(content.id)}
                                        />
                                    )}
                                    {content.type === ContentType.DOCUMENT && (
                                        <div className="p-4 flex justify-between items-center bg-orange-50 rounded-xl border border-orange-100">
                                            <span className="text-sm font-medium text-orange-900 flex items-center gap-2"><FileText size={16}/> {content.fileName}</span>
                                            <button onClick={() => handleViewContent(content.id)} className="text-orange-600 text-sm font-bold hover:underline">Ouvrir</button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleDownload(content)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        <Download size={16} /> Télécharger
                                    </button>
                                </div>

                                {/* Comments Section */}
                                <ContentComments 
                                    content={content} 
                                    currentUser={currentUser} 
                                    onUpdate={() => setForceUpdate(prev => prev + 1)} 
                                />
                            </div>
                        </div>
                    </div>
                 ))
             )}
          </div>

          <div className="space-y-6">
              <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <h3 className="font-bold text-xl relative z-10 mb-4">Quiz & Évaluations</h3>
                  {quizzes.length === 0 ? (
                      <p className="text-indigo-200 text-sm">Aucun quiz disponible pour ce cours.</p>
                  ) : (
                      <div className="space-y-3 relative z-10">
                          {quizzes.map(q => (
                              <div key={q.id} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:bg-white/20 transition-colors cursor-pointer" onClick={() => startQuiz(q)}>
                                  <div className="flex justify-between items-center">
                                      <span className="font-bold text-sm">{q.title}</span>
                                      <ChevronRight size={16} className="text-indigo-300"/>
                                  </div>
                                  <div className="text-xs text-indigo-200 mt-1 flex gap-3">
                                      <span>{q.questions.length} questions</span>
                                      <span>{q.timeLimitMinutes} min</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export const StudentProfile: React.FC<StudentProps> = ({ currentUser }) => {
    const handlePrintCertificate = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow?.document.write(`
            <html>
            <head><title>Certificat</title></head>
            <body style="text-align:center; padding: 50px; font-family: 'Georgia', serif; border: 10px double #042f2e;">
                <h1 style="color: #042f2e; font-size: 40px; margin-bottom: 10px;">Certificat de Réussite</h1>
                <p style="font-size: 20px;">Décerné à</p>
                <h2 style="font-size: 30px; margin: 20px 0; color: #0d9488;">${currentUser.firstName} ${currentUser.lastName}</h2>
                <p>Pour avoir complété avec succès le</p>
                <h3>NIVEAU ${currentUser.level || 1}</h3>
                <p>Date: ${new Date().toLocaleDateString()}</p>
                <br/><br/>
                <p>_____________________<br/>L'Administration Quran SN</p>
            </body>
            </html>
        `);
        printWindow?.document.close();
        printWindow?.print();
    };

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2000000) { // 2MB limit
                alert("L'image est trop lourde (Max 2MB).");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                // Create updated user object
                const updatedUser = { ...currentUser, bannerUrl: base64 };
                // Save
                storageService.updateUser(updatedUser);
                // Reload to reflect changes (simplest way given props structure)
                window.location.reload();
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            {/* Header Profile Card (Enhanced Design) */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                {/* Customizable Banner */}
                <div className="h-48 bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500 relative overflow-hidden group">
                    {currentUser.bannerUrl && (
                        <img src={currentUser.bannerUrl} alt="Cover" className="absolute top-0 left-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
                    
                    {/* Decorative shapes if no banner */}
                    {!currentUser.bannerUrl && (
                         <div className="absolute top-0 left-0 w-full h-full opacity-30">
                            <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white blur-3xl"></div>
                            <div className="absolute bottom-[-50%] right-[-10%] w-[400px] h-[400px] rounded-full bg-yellow-300 blur-3xl"></div>
                        </div>
                    )}

                    <label className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-lg backdrop-blur-md transition-all cursor-pointer opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                        <Settings size={20} />
                        <span className="sr-only">Modifier la bannière</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                    </label>
                </div> 

                <div className="px-8 pb-8">
                    <div className="relative -mt-20 mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
                        <div className="flex items-end gap-6">
                            <div className="w-40 h-40 bg-white p-1.5 rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300 group">
                                <div className="w-full h-full bg-slate-50 rounded-2xl flex items-center justify-center text-5xl font-bold text-slate-700 border-2 border-slate-100 overflow-hidden relative">
                                     {currentUser.firstName[0]}{currentUser.lastName[0]}
                                </div>
                            </div>
                            <div className="mb-2">
                                <h2 className="text-3xl font-bold text-gray-800">{currentUser.firstName} {currentUser.lastName}</h2>
                                <p className="text-gray-500 flex items-center gap-2">{currentUser.email} <span className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full font-bold">Premium</span></p>
                            </div>
                        </div>

                        {/* Gamification Stats Cards (Enhanced Colors) */}
                        <div className="flex gap-4">
                             <div className="text-center bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 shadow-lg shadow-indigo-100 px-6 py-3 rounded-2xl">
                                 <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Niveau</div>
                                 <div className="font-black text-3xl text-indigo-900">{currentUser.level || 1}</div>
                             </div>
                             <div className="text-center bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-200 px-6 py-3 rounded-2xl transform -translate-y-2">
                                 <div className="text-xs text-amber-100 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><Star size={12} fill="currentColor"/> XP</div>
                                 <div className="font-black text-3xl">{currentUser.xp || 0}</div>
                             </div>
                        </div>
                    </div>
                    
                    {/* Referral Code */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center mb-8 max-w-md">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Code Parrainage</p>
                            <p className="font-mono text-lg font-bold text-slate-800 tracking-wider">{currentUser.referralCode}</p>
                        </div>
                        <button onClick={() => alert("Copié !")} className="text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"><Share2 size={16}/> Copier</button>
                    </div>

                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg"><Award className="text-amber-500"/> Badges & Réussites</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {BADGES_LIST.map(badge => {
                            const isUnlocked = currentUser.badges && currentUser.badges.some(b => b.id === badge.id);
                            return (
                                <div key={badge.id} className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${isUnlocked ? 'bg-amber-50 border-amber-200 shadow-sm scale-105' : 'bg-gray-50 border-gray-100 opacity-60 grayscale'}`}>
                                    <div className="text-4xl mb-3 drop-shadow-sm">{badge.icon}</div>
                                    <div className="font-bold text-xs text-gray-800 leading-tight">{badge.name}</div>
                                    {isUnlocked && <div className="mt-2 text-[10px] bg-amber-200/50 text-amber-800 px-2 py-0.5 rounded-full font-bold">Débloqué</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Certificate Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                        <Award size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-gray-800">Mes Certificats</h3>
                        <p className="text-gray-500 text-sm mt-1">Téléchargez vos certificats officiels une fois le niveau validé.</p>
                    </div>
                </div>
                {currentUser.level > 0 ? (
                    <button onClick={handlePrintCertificate} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-teal-700 shadow-lg shadow-teal-600/20 w-full md:w-auto justify-center">
                        <Download size={18}/> Télécharger Niveau 1
                    </button>
                ) : (
                    <button disabled className="bg-gray-100 text-gray-400 px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed w-full md:w-auto justify-center">
                        <Lock size={18}/> Pas encore disponible
                    </button>
                )}
            </div>
            
            {/* Leaderboard */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2"><Star className="text-yellow-400 fill-yellow-400"/> Classement Général</h3>
                <div className="space-y-2">
                    {storageService.getLeaderboard().map((u, idx) => (
                        <div key={u.id} className="flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-slate-50 border border-transparent hover:border-slate-100">
                            <div className={`font-black w-8 text-center ${idx < 3 ? 'text-amber-500 text-2xl drop-shadow-sm' : 'text-gray-300 text-lg'}`}>#{idx + 1}</div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center font-bold text-white text-sm shadow-md">{u.firstName[0]}</div>
                            <div className="flex-1 font-bold text-gray-700">{u.firstName} {u.lastName}</div>
                            <div className="font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-lg text-sm">{u.xp} XP</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};