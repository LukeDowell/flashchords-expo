import {NoteEvent} from "@/lib/music/MidiPiano";

export class Results {
  _startTime: number = 0
  _successfulNotes: Array<NoteEvent> = []

  constructor(startTime: number, successfulNotes: Array<NoteEvent> = []) {
    this._startTime = startTime
    this._successfulNotes = successfulNotes.slice()
  }

  /**
   * @param bpm
   */
  getDistanceFromBeat(bpm: number): Array<[NoteEvent, number]> {
    return []
  }
}
