# Intro Video

Place the intro video file here with the following filename:

**ivt-intro.mp4**

## Video Specifications

- Format: MP4
- Recommended resolution: 1920x1080 (Full HD) or higher
- Recommended aspect ratio: 16:9
- The video should be optimized for web playback
- Keep file size reasonable for fast loading (under 50MB recommended)

## Behavior

- The video will autoplay (muted) on first visit
- Users can skip the video at any time
- After the video ends or is skipped, a flag is stored in localStorage
- On subsequent visits, the video will not autoplay
- Users can replay the video anytime using the "Intro" button in the header
- If the video fails to load, a static fallback overlay with the same text will be shown
