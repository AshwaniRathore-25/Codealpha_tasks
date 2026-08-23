document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const mainAudio = document.getElementById('mainAudioElement');
  const trackTitle = document.getElementById('trackTitle');
  const trackArtist = document.getElementById('trackArtist');
  const trackGenre = document.getElementById('trackGenre');
  const albumCoverImg = document.getElementById('albumCoverImg');
  const vinylRecord = document.getElementById('vinylRecord');
  const equalizerVisualizer = document.getElementById('equalizerVisualizer');

  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const repeatBtn = document.getElementById('repeatBtn');
  const muteBtn = document.getElementById('muteBtn');
  const volumeIcon = document.getElementById('volumeIcon');
  const volumeSlider = document.getElementById('volumeSlider');
  const speedSelect = document.getElementById('speedSelect');
  const likeBtn = document.getElementById('likeBtn');
  const likeIcon = document.getElementById('likeIcon');

  const currentTimeEl = document.getElementById('currentTime');
  const totalDurationEl = document.getElementById('totalDuration');
  const progressBarContainer = document.getElementById('progressBarContainer');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressThumb = document.getElementById('progressThumb');

  const playlistToggleBtn = document.getElementById('playlistToggleBtn');
  const playlistDrawer = document.getElementById('playlistDrawer');
  const closePlaylistBtn = document.getElementById('closePlaylistBtn');
  const playlistSearchInput = document.getElementById('playlistSearchInput');
  const playlistTracksList = document.getElementById('playlistTracksList');
  const playlistTrackCount = document.getElementById('playlistTrackCount');
  const playlistBadgeCount = document.getElementById('playlistBadgeCount');
  const customAudioInput = document.getElementById('customAudioInput');
  const clearCustomTracksBtn = document.getElementById('clearCustomTracksBtn');

  const visualizerCanvas = document.getElementById('visualizerCanvas');
  const canvasCtx = visualizerCanvas ? visualizerCanvas.getContext('2d') : null;

  // Default Playlist Data (Royalty-Free Beats)
  const defaultPlaylist = [
    {
      id: 1,
      title: "Cyberpunk Synthwave",
      artist: "Neon Dreamer",
      genre: "Synthwave",
      duration: "2:45",
      cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
      src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3",
      liked: false
    },
    {
      id: 2,
      title: "Lofi Chill Study",
      artist: "Midnight Study",
      genre: "Lofi Beats",
      duration: "3:10",
      cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
      src: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3",
      liked: false
    },
    {
      id: 3,
      title: "Ambient Sunset Horizons",
      artist: "Aura Waves",
      genre: "Ambient",
      duration: "2:20",
      cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
      src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73256.mp3?filename=ambient-piano-amp-strings-10711.mp3",
      liked: false
    },
    {
      id: 4,
      title: "Future Bass Energy",
      artist: "Electronic Beats",
      genre: "EDM",
      duration: "2:55",
      cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
      src: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7e4df.mp3?filename=future-bass-124803.mp3",
      liked: false
    }
  ];

  let playlist = [...defaultPlaylist];
  let filteredPlaylist = [...playlist];
  let currentTrackIndex = 0;
  let isPlaying = false;
  let isShuffle = false;
  let repeatMode = 0; // 0: Off, 1: Repeat One, 2: Repeat All
  let isMuted = false;
  let previousVolume = 0.8;

  // Web Audio Visualizer Variables
  let audioCtx = null;
  let analyser = null;
  let dataArray = null;
  let sourceNode = null;

  // Initialize Player
  loadTrack(currentTrackIndex);
  renderPlaylist();

  // Load Selected Track
  function loadTrack(index) {
    if (playlist.length === 0) return;

    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];

    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    trackGenre.textContent = track.genre || 'Music';
    albumCoverImg.src = track.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80';
    mainAudio.src = track.src;

    // Apply speed
    if (speedSelect) mainAudio.playbackRate = parseFloat(speedSelect.value);

    // Update Like State
    updateLikeState(track.liked);

    // Reset progress UI
    currentTimeEl.textContent = '0:00';
    totalDurationEl.textContent = track.duration || '0:00';
    progressBarFill.style.width = '0%';
    progressThumb.style.left = '0%';

    document.title = `${isPlaying ? '▶' : '⏸'} ${track.title} - SoundWave`;
    updateActivePlaylistItem();
  }

  // Play Audio
  function playSong() {
    isPlaying = true;
    playIcon.className = 'fa-solid fa-pause';
    vinylRecord.classList.add('playing');
    equalizerVisualizer.classList.add('playing');
    
    document.title = `▶ ${playlist[currentTrackIndex]?.title || 'Music'} - SoundWave`;

    // Initialize Web Audio API Visualizer if available
    initAudioVisualizer();

    mainAudio.play().catch(err => {
      console.log('Autoplay prevented or network error, ready for interaction:', err);
    });
  }

  // Pause Audio
  function pauseSong() {
    isPlaying = false;
    playIcon.className = 'fa-solid fa-play';
    vinylRecord.classList.remove('playing');
    equalizerVisualizer.classList.remove('playing');
    document.title = `SoundWave - Music Player`;
    mainAudio.pause();
  }

  // Toggle Play / Pause
  function togglePlayPause() {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  }

  // Previous Track
  function prevTrack() {
    if (isShuffle) {
      currentTrackIndex = Math.floor(Math.random() * playlist.length);
    } else {
      currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    }
    loadTrack(currentTrackIndex);
    playSong();
  }

  // Next Track
  function nextTrack() {
    if (isShuffle) {
      currentTrackIndex = Math.floor(Math.random() * playlist.length);
    } else {
      currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    }
    loadTrack(currentTrackIndex);
    playSong();
  }

  // Track Ended Event (Autoplay feature)
  mainAudio.addEventListener('ended', () => {
    if (repeatMode === 1) { // Repeat One
      mainAudio.currentTime = 0;
      playSong();
    } else if (repeatMode === 2 || currentTrackIndex < playlist.length - 1 || isShuffle) { // Repeat All / Autoplay Next
      nextTrack();
    } else {
      pauseSong();
    }
  });

  // Time & Progress Bar Updates
  mainAudio.addEventListener('timeupdate', (e) => {
    const { currentTime, duration } = e.target;
    if (isNaN(duration) || duration === 0) return;

    const progressPercent = (currentTime / duration) * 100;
    progressBarFill.style.width = `${progressPercent}%`;
    progressThumb.style.left = `${progressPercent}%`;

    currentTimeEl.textContent = formatTime(currentTime);
    totalDurationEl.textContent = formatTime(duration);
  });

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Click & Seek on Progress Bar
  progressBarContainer.addEventListener('click', (e) => {
    const width = progressBarContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = mainAudio.duration;

    if (!isNaN(duration) && duration > 0) {
      mainAudio.currentTime = (clickX / width) * duration;
    }
  });

  // Volume Control
  volumeSlider.addEventListener('input', (e) => {
    const val = e.target.value / 100;
    mainAudio.volume = val;
    isMuted = val === 0;
    updateVolumeIcon(val);
  });

  function updateVolumeIcon(val) {
    if (val === 0 || isMuted) {
      volumeIcon.className = 'fa-solid fa-volume-xmark';
    } else if (val < 0.5) {
      volumeIcon.className = 'fa-solid fa-volume-low';
    } else {
      volumeIcon.className = 'fa-solid fa-volume-high';
    }
  }

  // Mute Toggle
  muteBtn.addEventListener('click', () => {
    if (isMuted) {
      mainAudio.volume = previousVolume;
      volumeSlider.value = previousVolume * 100;
      isMuted = false;
    } else {
      previousVolume = mainAudio.volume || 0.8;
      mainAudio.volume = 0;
      volumeSlider.value = 0;
      isMuted = true;
    }
    updateVolumeIcon(mainAudio.volume);
  });

  // Shuffle Mode Toggle
  shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
    shuffleBtn.title = isShuffle ? 'Shuffle (On)' : 'Shuffle (Off)';
  });

  // Repeat Mode Toggle
  repeatBtn.addEventListener('click', () => {
    repeatMode = (repeatMode + 1) % 3;
    const repeatTitles = ['Repeat (Off)', 'Repeat (Song)', 'Repeat (All)'];

    repeatBtn.className = `icon-btn-sm ${repeatMode > 0 ? 'active' : ''}`;
    repeatBtn.title = repeatTitles[repeatMode];

    if (repeatMode === 1) {
      repeatBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> 1';
    } else {
      repeatBtn.innerHTML = '<i class="fa-solid fa-repeat"></i>';
    }
  });

  // Playback Speed Selector
  if (speedSelect) {
    speedSelect.addEventListener('change', (e) => {
      mainAudio.playbackRate = parseFloat(e.target.value);
    });
  }

  // Like Button Handler
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      if (playlist[currentTrackIndex]) {
        playlist[currentTrackIndex].liked = !playlist[currentTrackIndex].liked;
        updateLikeState(playlist[currentTrackIndex].liked);
      }
    });
  }

  function updateLikeState(isLiked) {
    if (isLiked) {
      likeBtn.classList.add('liked');
      likeIcon.className = 'fa-solid fa-heart';
    } else {
      likeBtn.classList.remove('liked');
      likeIcon.className = 'fa-regular fa-heart';
    }
  }

  // Button Event Listeners
  playPauseBtn.addEventListener('click', togglePlayPause);
  prevBtn.addEventListener('click', prevTrack);
  nextBtn.addEventListener('click', nextTrack);

  // --- Playlist Drawer Controls ---
  playlistToggleBtn.addEventListener('click', () => {
    playlistDrawer.classList.toggle('open');
  });

  closePlaylistBtn.addEventListener('click', () => {
    playlistDrawer.classList.remove('open');
  });

  // Playlist Search Filter
  if (playlistSearchInput) {
    playlistSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      filteredPlaylist = playlist.filter(track => 
        track.title.toLowerCase().includes(query) || 
        track.artist.toLowerCase().includes(query)
      );
      renderPlaylist(filteredPlaylist);
    });
  }

  function renderPlaylist(listToRender = playlist) {
    playlistTrackCount.textContent = playlist.length;
    playlistBadgeCount.textContent = playlist.length;

    if (listToRender.length === 0) {
      playlistTracksList.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">No songs found</div>';
      return;
    }

    playlistTracksList.innerHTML = listToRender.map((track) => {
      const realIndex = playlist.findIndex(t => t.id === track.id);
      return `
        <div class="track-item ${realIndex === currentTrackIndex ? 'active' : ''}" data-index="${realIndex}">
          <img src="${track.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80'}" class="item-thumb" alt="Track Cover">
          <div class="item-info">
            <div class="item-title">${track.title}</div>
            <div class="item-artist">${track.artist}</div>
          </div>
          <div class="item-duration">${track.duration || '3:00'}</div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.track-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        loadTrack(index);
        playSong();
      });
    });
  }

  function updateActivePlaylistItem() {
    document.querySelectorAll('.track-item').forEach((item) => {
      const idx = parseInt(item.dataset.index);
      if (idx === currentTrackIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // --- Custom MP3 Song Upload Support ---
  customAudioInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach((file, index) => {
      const audioUrl = URL.createObjectURL(file);
      const newTrack = {
        id: Date.now() + index,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Local Upload",
        genre: "Custom Audio",
        duration: "Local MP3",
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
        src: audioUrl,
        liked: false
      };
      playlist.unshift(newTrack);
    });

    filteredPlaylist = [...playlist];
    renderPlaylist();
    loadTrack(0);
    playSong();
    playlistDrawer.classList.add('open');
  });

  clearCustomTracksBtn.addEventListener('click', () => {
    playlist = [...defaultPlaylist];
    filteredPlaylist = [...playlist];
    if (playlistSearchInput) playlistSearchInput.value = '';
    renderPlaylist();
    loadTrack(0);
  });

  // --- Web Audio Visualizer Setup ---
  function initAudioVisualizer() {
    if (!canvasCtx || audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      sourceNode = audioCtx.createMediaElementSource(mainAudio);

      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);

      analyser.fftSize = 64;
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      drawCanvasVisualizer();
    } catch (e) {
      console.log('Web Audio visualizer setup note:', e);
    }
  }

  function drawCanvasVisualizer() {
    if (!canvasCtx || !analyser) return;

    requestAnimationFrame(drawCanvasVisualizer);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

    if (!isPlaying) return;

    const centerX = visualizerCanvas.width / 2;
    const centerY = visualizerCanvas.height / 2;
    const radius = 80;
    const barCount = dataArray.length;

    for (let i = 0; i < barCount; i++) {
      const barHeight = (dataArray[i] / 255) * 30;
      const rad = (i / barCount) * Math.PI * 2;

      const x1 = centerX + Math.cos(rad) * radius;
      const y1 = centerY + Math.sin(rad) * radius;
      const x2 = centerX + Math.cos(rad) * (radius + barHeight);
      const y2 = centerY + Math.sin(rad) * (radius + barHeight);

      canvasCtx.strokeStyle = `hsl(${i * 12 + 180}, 90%, 60%)`;
      canvasCtx.lineWidth = 3;
      canvasCtx.beginPath();
      canvasCtx.moveTo(x1, y1);
      canvasCtx.lineTo(x2, y2);
      canvasCtx.stroke();
    }
  }

  // --- Keyboard Shortcuts ---
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (mainAudio.currentTime > 5) mainAudio.currentTime -= 5;
        else mainAudio.currentTime = 0;
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (mainAudio.currentTime + 5 < mainAudio.duration) mainAudio.currentTime += 5;
        break;
      case 'ArrowUp':
        e.preventDefault();
        mainAudio.volume = Math.min(1, mainAudio.volume + 0.1);
        volumeSlider.value = mainAudio.volume * 100;
        updateVolumeIcon(mainAudio.volume);
        break;
      case 'ArrowDown':
        e.preventDefault();
        mainAudio.volume = Math.max(0, mainAudio.volume - 0.1);
        volumeSlider.value = mainAudio.volume * 100;
        updateVolumeIcon(mainAudio.volume);
        break;
      case 'KeyN':
        nextTrack();
        break;
      case 'KeyP':
        prevTrack();
        break;
      case 'KeyM':
        muteBtn.click();
        break;
    }
  });
});
