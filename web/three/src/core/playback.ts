/** 播放意图与临时挂起分离；不依赖设备、DOM 或墙钟。 */
export class TimelinePlayer {
  time = 0;
  playing = false;
  suspended = false;
  private previous: number | null = null;
  constructor(readonly duration: number) {
    if (!Number.isFinite(duration) || duration <= 0) throw new Error('播放时长必须为有限正数');
  }
  play() { if (this.time >= this.duration) this.time = 0; this.playing = true; this.previous = null; }
  pause() { this.playing = false; this.previous = null; }
  restart() { this.time = 0; this.play(); }
  seek(seconds: number) {
    this.time = Number.isFinite(seconds) ? Math.max(0, Math.min(this.duration, seconds)) : 0;
    this.previous = null;
    if (this.time === this.duration) this.pause();
  }
  setSuspended(value: boolean) { if (value !== this.suspended) this.previous = null; this.suspended = value; }
  advance(timestamp: number) {
    if (!Number.isFinite(timestamp)) return;
    if (!this.playing || this.suspended) { this.previous = null; return; }
    if (this.previous !== null) this.time = Math.min(this.duration, this.time + Math.max(0, timestamp - this.previous) / 1000);
    this.previous = timestamp;
    if (this.time === this.duration) this.pause();
  }
}
