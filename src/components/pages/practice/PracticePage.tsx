import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useInterval} from "@/lib/react/hooks";
import {DEFAULT_PRACTICE_SETTINGS, Settings} from "@/components/settings/Settings";
import {Note} from "@/lib/music/Note";
import _ from "lodash";
import {VoicingHistory, VoicingResult} from "./VoicingHistory";
import {
  CIRCLE_OF_FIFTHS,
  diatonicChords,
  getKey,
  isValidVoicingForChord,
  MusicKey,
  notesInKey
} from "@/lib/music/Circle";
import {InteractiveStaff} from "@/components/interactivestaff/InteractiveStaff";
import {Chord} from "@/lib/music/Chord";
import styled from "@emotion/native";
import {NoteEvent} from "@/lib/music/MidiPiano";
import {InstrumentContext, MidiPianoContext} from "@/lib/react/contexts";
import {IconSymbol} from "@/components/ui/IconSymbol";
import {View} from "react-native";

export interface Props {
  initialChord?: Chord,
  initialKey?: MusicKey,
  initialSettings?: Partial<Settings>
}

export const generateChordFromSettings = (settings: Settings): [Chord, MusicKey] => {
  const key = _.sample(CIRCLE_OF_FIFTHS)!!
  return [_.sample(diatonicChords(key, _.random(1, 2) % 2 === 0))!!, key]
}


const StyledRoot = styled.View`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-width: 100%;
`

const StaffContainer = styled.View`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    min-height: 200px;
`
const ChordSymbolPrompt = styled.Text`
  display: flex;
  align-items: center;
  justify-content: center;
`

const CurrentChordSymbol = styled.Text`
  margin-top: 0;
  margin-bottom: 0;
`

export default function PracticePage({
                                       initialChord = new Chord('Db', 'Major'),
                                       initialKey = getKey('Db', 'Major'),
                                       initialSettings = DEFAULT_PRACTICE_SETTINGS
                                     }: Props) {
  const piano = useContext(MidiPianoContext)
  const sample = useContext(InstrumentContext)
  // const instrument = useInstrument(sample, true)
  const [currentChord, setCurrentChord] = useState<Chord>(initialChord)
  const [currentKey, setCurrentKey] = useState<MusicKey>(initialKey)
  const [timeOfLastSuccess, setTimeOfLastSuccess] = useState(Date.now())
  const [shouldDisplaySuccess, setShouldDisplaySuccess] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [timerProgress, setTimerProgress] = useState(100)
  const [settings, setSettings] = useState({...DEFAULT_PRACTICE_SETTINGS, ...initialSettings})
  const [voicingResults, setVoicingResults] = useState<VoicingResult[]>([])

  const generateNewChord = useCallback(() => {
    let [newChord, newKey] = generateChordFromSettings(settings)
    while (_.isEqual(currentChord, newChord)) {
      [newChord, newKey] = generateChordFromSettings(settings)
    }
    setCurrentChord(newChord)
    setCurrentKey(newKey)
  }, [currentChord, settings])

  useEffect(() => {
    if (!piano) return
    const callback = (noteEvent: NoteEvent, activeNotes: Note[]) => {
      if (isValidVoicingForChord(activeNotes, currentChord)) {
        setShouldDisplaySuccess(true)
        setTimeOfLastSuccess(Date.now())
        setVoicingResults([...voicingResults, {
          chord: currentChord,
          key: currentKey,
          validNotes: notesInKey(activeNotes, currentKey)
        }])
        generateNewChord()
      }
    };

    const id = _.uniqueId('practice-page-')
    piano.addSubscriber(id, callback)
    return () => piano.removeSubscriber(id)
  }, [currentChord, piano, generateNewChord, voicingResults, currentKey])

  useInterval(() => {
    const inTimeWindow = Date.now() - timeOfLastSuccess <= 1000
    if (!inTimeWindow && shouldDisplaySuccess) {
      setShouldDisplaySuccess(false)
    }
  }, 50)

  useInterval(() => {
    if (!settings?.timerEnabled) return
    const timeLeft = (timeOfLastSuccess + (settings.timerMilliseconds)) - Date.now()
    if (timeLeft <= 0) {
      setVoicingResults([...voicingResults, {chord: currentChord, key: currentKey, validNotes: []}])
      setTimeOfLastSuccess(Date.now())
      generateNewChord()
    } else setTimerProgress(Math.floor((timeLeft / (settings.timerMilliseconds)) * 100))
  }, 50)

  return <StyledRoot>
    <ChordSymbolPrompt>
      <CurrentChordSymbol>{currentChord.toString()}</CurrentChordSymbol>
      {shouldDisplaySuccess && <IconSymbol testID="CheckIcon" color={"green"} name={"checkmark.circle.fill"}/>}
    </ChordSymbolPrompt>
    <StaffContainer>
      <InteractiveStaff musicKey={currentKey}
                        chords={[currentChord].concat(_.reverse(voicingResults.slice()).map(v => v.chord))}
                        chordVoicings={_.reverse(voicingResults.slice()).map(v => v.validNotes)}
      />
    </StaffContainer>
    {/*{settings?.timerEnabled && <LinearProgress className="timer" variant="determinate" value={timerProgress}/>}*/}
    <VoicingHistory voicingResults={voicingResults}/>
  </StyledRoot>
}
