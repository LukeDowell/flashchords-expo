import React, {useEffect, useState} from "react"
import {getKey, MusicKey, notesInKey} from "@/lib/music/Circle";
import {Formatter, Stave, Voice} from "vexflow4";
import {Note, placeOnOctave} from "@/lib/music/Note";
import {Chord} from "@/lib/music/Chord";
import {notesToStaveNote} from "@/lib/vexMusic";
import {useWindowDimensions, View} from "react-native";
import ReactNativeSVGContext from "@/components/vexflow/ReactNativeSVGContext";


type Result = {
  /** Instant that the game started */
  gameStartTime: number,

  /** Array of Note + instant-note-was-played tuples */
  notesPlayed: Array<[Note, number]>,
}

type Config = {
  beatsPerMinute?: number
}

interface Props {
  musicKey?: MusicKey,
  chords?: Chord[],
  chordVoicings?: Array<Note[]>
  callback?: (r: Result) => any,
  config?: Config
}

export function InteractiveStaff(props: Props) {
  const {
    musicKey = getKey('C', 'Major'),
    chords = [],
    chordVoicings = [],
    config = {
      beatsPerMinute: props?.config?.beatsPerMinute || 60,
    }
  } = props

  const {height, width} = useWindowDimensions()
  const [svgContext, setSvgContext] = useState(undefined as ReactNativeSVGContext | undefined)

  useEffect(() => {
    const context = new ReactNativeSVGContext({width: width - (width / 18), height: height / 4})
    // context.scale(1.3, 1.3)

    // Build a stave
    const keySignatureStaveSize = width / 8
    const staveMarginTop = 75
    const keySignatureStave = new Stave(0, staveMarginTop, keySignatureStaveSize)
    keySignatureStave.addClef('treble').addTimeSignature('4/4').addKeySignature(musicKey.root.withOctave(undefined).toString())
    keySignatureStave.setContext(context).draw()

    // Additional stave per chord
    chords?.forEach((c: Chord, i) => {
      const staveWidth = keySignatureStaveSize * (i + 1)
      const chordStave = new Stave(staveWidth, staveMarginTop, width / 8)
      chordStave.setContext(context).draw()

      const chordVoicing = chordVoicings[i - 1]
      const staveNotes = (chordVoicing && chordVoicing.length > 0)
        ? notesToStaveNote(chordVoicing, {fillStyle: 'green', chord: c})
        : notesToStaveNote(placeOnOctave(4, notesInKey(c.notes(), musicKey)), {chord: c})

      const voice = new Voice({numBeats: 4, beatValue: 4})
      voice.addTickables([staveNotes])

      new Formatter().joinVoices([voice]).format([voice], staveWidth)

      voice.draw(context, chordStave)
    })

    setSvgContext(context)
  }, [musicKey, chords, width, height, chordVoicings])

  return (<View>
    {svgContext ? svgContext.render() : false}
  </View>)
}
